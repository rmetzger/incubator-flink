/*
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

package org.apache.flink.yarn

import java.io.File
import java.nio.ByteBuffer
import java.util.Collections

import akka.actor.ActorRef
import org.apache.flink.configuration.ConfigConstants
import org.apache.flink.runtime.ActorLogMessages
import org.apache.flink.runtime.jobmanager.JobManager
import org.apache.flink.runtime.messages.Messages.Acknowledge
import org.apache.flink.runtime.yarn.FlinkYarnClusterStatus
import org.apache.flink.yarn.Messages._
import org.apache.flink.yarn.appMaster.YarnTaskManagerRunner
import org.apache.hadoop.conf.Configuration
import org.apache.hadoop.fs.{FileSystem, Path}
import org.apache.hadoop.io.DataOutputBuffer
import org.apache.hadoop.security.UserGroupInformation
import org.apache.hadoop.yarn.api.ApplicationConstants
import org.apache.hadoop.yarn.api.ApplicationConstants.Environment
import org.apache.hadoop.yarn.api.records._
import org.apache.hadoop.yarn.client.api.async.NMClientAsync
import org.apache.hadoop.yarn.client.api.{NMClient, AMRMClient}
import org.apache.hadoop.yarn.client.api.AMRMClient.ContainerRequest
import org.apache.hadoop.yarn.util.Records

import scala.collection.mutable
import scala.concurrent.duration._
import scala.language.postfixOps
import scala.util.Try


trait ApplicationMasterActor extends ActorLogMessages {
  that: JobManager =>

  import context._
  import scala.collection.JavaConverters._

  val ALLOCATION_DELAY = 300 milliseconds
  val COMPLETION_DELAY = 5 seconds

  var rmClientOption: Option[AMRMClient[ContainerRequest]] = None
  var nmClientOption: Option[NMClient] = None
  var messageListener:Option[ActorRef] = None
  var containerLaunchContext: Option[ContainerLaunchContext] = None

  var runningContainers = 0 // number of currently running containers
  var failedContainers = 0 // failed container count
  var numTaskManager = 0 // the requested number of TMs
  var maxFailedContainers = 0
  var containersLaunched = 0

  var memoryPerTaskManager = 0

  // list of containers available for starting
  var allocatedContainersList: mutable.MutableList[Container] = new mutable.MutableList[Container]
  var runningContainersList: mutable.MutableList[Container] = new mutable.MutableList[Container]


  abstract override def receiveWithLogMessages: Receive = {
    receiveYarnMessages orElse super.receiveWithLogMessages
  }

  def receiveYarnMessages: Receive = {
    case StopYarnSession(status) =>
      log.info("Stopping YARN JobManager with status {}.", status)

      instanceManager.getAllRegisteredInstances.asScala foreach {
        instance =>
          instance.getTaskManager ! StopYarnSession(status)
      }

      rmClientOption foreach {
        rmClient =>
          Try(rmClient.unregisterApplicationMaster(status, "", "")).recover{
            case t: Throwable => log.error(t, "Could not unregister the application master.")
          }

          Try(rmClient.close()).recover{
            case t:Throwable => log.error(t, "Could not close the AMRMClient.")
          }
      }

      rmClientOption = None

      nmClientOption foreach {
        nmClient =>
        Try(nmClient.close()).recover{
          case t: Throwable => log.error(t, "Could not close the NMClient.")
        }
      }

      nmClientOption = None
      messageListener foreach {
          _ ! JobManagerStopped
      }

      context.system.shutdown()

    case RegisterClient(client) =>
      log.info("Register {} as client.", client.path)
      messageListener = Some(client)
      sender ! Acknowledge

    case PollYarnClusterStatus =>
      sender() ! new FlinkYarnClusterStatus(instanceManager.getNumberOfRegisteredTaskManagers,
        instanceManager.getTotalNumberOfSlots)

    case StartYarnSession(conf, actorSystemPort, webServerPort) =>
      startYarnSession(conf, actorSystemPort, webServerPort)

    case HeartbeatWithYarn =>
      rmClientOption match {
        case Some(rmClient) =>
          val response = rmClient.allocate(runningContainers.toFloat / numTaskManager)

          // ---------------------------- handle YARN responses -------------

          // get new containers from YARN
          for (container <- response.getAllocatedContainers.asScala) {
            log.info(s"Got new container for allocation: ${container.getId}")
            allocatedContainersList += container
            // REMOVEME
            log.info("allocatedContainersList.toString = {}", allocatedContainerIds())
          }

          // get failed containers
          for (status <- response.getCompletedContainersStatuses.asScala) {
            failedContainers += 1
            runningContainers -= 1
            log.info(s"Completed container ${status.getContainerId}. Total failed containers " +
              s"$failedContainers.")
            log.info(s"Diagnostics ${status.getDiagnostics}.")
            // remove failed container from running containers
            var failedContainer: Container = null
            log.info("Running containers {}", runningContainerIds())
            runningContainersList = runningContainersList.filter(runningContainer => {
              val result = runningContainer.getId.equals(status.getContainerId)
              if(result) {
                failedContainer = runningContainer
              }
              !result
            })
            if(failedContainer == null) {
              log.warning("Unable to find completed container id={} in " +
                "list of running containers {}", status.getContainerId, runningContainerIds())
            }
            allocatedContainersList += failedContainer
            messageListener foreach {
              val detail = status.getExitStatus match {
                case -103 => "Vmem limit exceeded";
                case -104 => "Pmem limit exceeded";
                case _ => ""
              }
              _ ! YarnMessage(s"Diagnostics for containerID=${status.getContainerId} in " +
                s"state=${status.getState}.\n${status.getDiagnostics} $detail")
            }
            // add container back to list of allocated containers

          }
          // return containers if the RM wants them and we haven't allocated them yet.
          val preemtionMessage = response.getPreemptionMessage
          if(preemtionMessage != null) {
            log.info("Received preemtion message from YARN {}", preemtionMessage)
            val contract = preemtionMessage.getContract
            if(contract != null) {
              tryToReturnContainers(contract.getContainers.asScala)
            }
            val strictContract = preemtionMessage.getStrictContract
            if(strictContract != null) {
              tryToReturnContainers(strictContract.getContainers.asScala)
            }
            // REMOVEME
            log.info("allocatedContainersList.toString = {}", allocatedContainerIds())
          }

          // ---------------------------- decide if we need to do anything ---------

          // check if we want to start some of our allocated containers.
          if(runningContainers < numTaskManager) {
            var missingContainers = numTaskManager - runningContainers
            log.info("The user requested {} containers, {} running. {} containers missing",
              numTaskManager, runningContainers, missingContainers)

            // not enough containers running
            if(allocatedContainersList.size > 0) {
              log.info("{} containers already allocated by YARN. Starting them.",
                allocatedContainersList.size)
              // we have some containers allocated to us --> start them
              // REMOVEME
              log.info("allocatedContainersList.toString = {}",  allocatedContainerIds())
              allocatedContainersList = allocatedContainersList.dropWhile(container => {
                if (missingContainers <= 0) {
                  require(missingContainers == 0, "The variable can not be negative. Illegal state")
                  false
                } else {
                  runningContainers += 1
                  missingContainers -= 1

                  log.info("Launching container #{} ({}).", containersLaunched, container.getId)
                  containersLaunched += 1
                  runningContainersList += container
                  // start the container
                  nmClientOption match {
                    case Some(nmClient) =>
                      containerLaunchContext match {
                        case Some(ctx) => nmClient.startContainer(container, ctx)
                        case None =>
                          log.error("The ContainerLaunchContext was not set.")
                          self ! StopYarnSession(FinalApplicationStatus.FAILED)
                      }
                    case None =>
                      log.error("The NMClient was not set.")
                      self ! StopYarnSession(FinalApplicationStatus.FAILED)
                  }
                  // dropping condition
                  true
                }
              })
            }
            // REMOVEME
            log.info("allocatedContainersList.toString = {}", allocatedContainerIds())
            // if there are still containers missing, request them from YARN
            if(missingContainers > 0) {
              val reallocate = configuration
                .getBoolean(ConfigConstants.YARN_REALLOCATE_FAILED_CONTAINERS, true)
              log.info("There are {} containers missing. Reallocation of failed containers" +
                "is set to {} ({})", missingContainers, reallocate,
                ConfigConstants.YARN_REALLOCATE_FAILED_CONTAINERS)
              // there are still containers missing. Request them from YARN
              if(reallocate) {
                log.info("Requesting {} new container(s) from YARN", missingContainers)
                for(i <- 0 to missingContainers) {
                  val containerRequest = getContainerRequest(memoryPerTaskManager)
                  rmClient.addContainerRequest(containerRequest)
                }
              }
            }
          }

          if(failedContainers >= maxFailedContainers) {
            log.warning("Stopping YARN session because the number of failed containers ({}) " +
              "exceeded the maximum failed container count ({})." +
              "This number is controlled by the '{}' configuration setting. By default its " +
              "the number of requested containers", failedContainers, maxFailedContainers,
              ConfigConstants.YARN_MAX_FAILED_CONTAINERS)
            self ! StopYarnSession(FinalApplicationStatus.FAILED)
          }

          // schedule next heartbeat:
          if (runningContainers < numTaskManager) {
            // we don't have the requested number of containers. Do fast polling
            context.system.scheduler.scheduleOnce(ALLOCATION_DELAY, self, HeartbeatWithYarn)
          } else if (failedContainers < numTaskManager) {
            // everything is good, slow polling
            context.system.scheduler.scheduleOnce(COMPLETION_DELAY, self, HeartbeatWithYarn)
          }
        case None =>
          log.error("The AMRMClient was not set.")
          self ! StopYarnSession(FinalApplicationStatus.FAILED)
      }
      log.debug("Processed Heartbeat with RMClient. Running containers {}," +
        "failed containers {}, allocated containers {}", runningContainers, failedContainers,
        allocatedContainersList.size)
  }

  private def runningContainerIds(): Unit = {
    return runningContainersList map { runningCont => runningCont.getId}
  }
  private def allocatedContainerIds(): Unit = {
    return runningContainersList map { runningCont => runningCont.getId}
  }

  private def startYarnSession(conf: Configuration,
                               actorSystemPort: Int,
                               webServerPort: Int): Unit = {
    Try {
      log.info("Start yarn session.")
      memoryPerTaskManager = env.get(FlinkYarnClient.ENV_TM_MEMORY).toInt
      val heapLimit = Utils.calculateHeapSize(memoryPerTaskManager)

      val applicationMasterHost = env.get(Environment.NM_HOST.key)
      require(applicationMasterHost != null, s"Application master (${Environment.NM_HOST} not set.")

      numTaskManager = env.get(FlinkYarnClient.ENV_TM_COUNT).toInt
      maxFailedContainers = configuration.getInteger(ConfigConstants.YARN_MAX_FAILED_CONTAINERS,
        numTaskManager)
      log.info("Requesting {} TaskManagers. Tolerating {} failed TaskManagers",
        numTaskManager, maxFailedContainers)


      val remoteFlinkJarPath = env.get(FlinkYarnClient.FLINK_JAR_PATH)
      val fs = FileSystem.get(conf)
      val appId = env.get(FlinkYarnClient.ENV_APP_ID)
      val currDir = env.get(Environment.PWD.key())
      val clientHomeDir = env.get(FlinkYarnClient.ENV_CLIENT_HOME_DIR)
      val shipListString = env.get(FlinkYarnClient.ENV_CLIENT_SHIP_FILES)
      val yarnClientUsername = env.get(FlinkYarnClient.ENV_CLIENT_USERNAME)

      val rm = AMRMClient.createAMRMClient[ContainerRequest]()
      rm.init(conf)
      rm.start()

      rmClientOption = Some(rm)

      val nm = NMClient.createNMClient()
      nm.init(conf)
      nm.start()
      nm.cleanupRunningContainersOnStop(true)

      nmClientOption = Some(nm)

      // Register with ResourceManager
      val url = s"http://$applicationMasterHost:$webServerPort"
      log.info(s"Registering ApplicationMaster with tracking url $url.")
      rm.registerApplicationMaster(applicationMasterHost, actorSystemPort, url)

      // Make container requests to ResourceManager
      for (i <- 0 until numTaskManager) {
        val containerRequest = getContainerRequest(memoryPerTaskManager)
        log.info(s"Requesting initial TaskManager container $i.")
        // these are initial requests. The reallocation setting doesn't affect this.
        rm.addContainerRequest(containerRequest)
      }

      val flinkJar = Records.newRecord(classOf[LocalResource])
      val flinkConf = Records.newRecord(classOf[LocalResource])

      // register Flink Jar with remote HDFS
      val remoteJarPath = new Path(remoteFlinkJarPath)
      Utils.registerLocalResource(fs, remoteJarPath, flinkJar)

      // register conf with local fs
      Utils.setupLocalResource(conf, fs, appId, new Path(s"file://$currDir/flink-conf-modified" +
        s".yaml"), flinkConf, new Path(clientHomeDir))
      log.info(s"Prepared local resource for modified yaml: $flinkConf")

      val hasLogback = new File(s"$currDir/logback.xml").exists()
      val hasLog4j = new File(s"$currDir/log4j.properties").exists()

      // prepare files to be shipped
      val resources = shipListString.split(",") flatMap {
        pathStr =>
          if (pathStr.isEmpty) {
            None
          } else {
            val resource = Records.newRecord(classOf[LocalResource])
            val path = new Path(pathStr)
            Utils.registerLocalResource(fs, path, resource)
            Some((path.getName, resource))
          }
      } toList

      val taskManagerLocalResources = ("flink.jar", flinkJar) ::("flink-conf.yaml",
        flinkConf) :: resources toMap

      runningContainers = 0
      failedContainers = 0

      containerLaunchContext = Some(createContainerLaunchContext(heapLimit, hasLogback, hasLog4j,
        yarnClientUsername, conf, taskManagerLocalResources))

      context.system.scheduler.scheduleOnce(ALLOCATION_DELAY, self, HeartbeatWithYarn)
    } recover {
      case t: Throwable =>
        log.error(t, "Could not start yarn session.")
        self ! StopYarnSession(FinalApplicationStatus.FAILED)
    }
  }

  private def tryToReturnContainers(returnRequest: mutable.Set[PreemptionContainer]): Unit = {
    for(requestedBackContainers <- returnRequest) {
      allocatedContainersList = allocatedContainersList.dropWhile( container => {
        val result = requestedBackContainers.equals(container)
        if(result) {
          log.info("Returning container {} back to ResourceManager.", container)
        }
        result
      })
    }
  }

  private def getContainerRequest(memoryPerTaskManager: Int): ContainerRequest = {
    // Priority for worker containers - priorities are intra-application
    val priority = Records.newRecord(classOf[Priority])
    priority.setPriority(0)

    // Resource requirements for worker containers
    val capability = Records.newRecord(classOf[Resource])
    capability.setMemory(memoryPerTaskManager)
    capability.setVirtualCores(1) // hard-code that number (YARN is not accounting for CPUs)
    new ContainerRequest(capability, null, null, priority)
  }

  private def createContainerLaunchContext(heapLimit: Int, hasLogback: Boolean, hasLog4j: Boolean,
                                   yarnClientUsername: String, yarnConf: Configuration,
                                   taskManagerLocalResources: Map[String, LocalResource]):
  ContainerLaunchContext = {
    log.info("Create container launch context.")
    val ctx = Records.newRecord(classOf[ContainerLaunchContext])

    val javaOpts = configuration.getString(ConfigConstants.FLINK_JVM_OPTIONS, "")
    val tmCommand = new StringBuilder(s"$$JAVA_HOME/bin/java -Xmx${heapLimit}m $javaOpts")

    if (hasLogback || hasLog4j) {
      tmCommand ++=
        s""" -Dlog.file="${ApplicationConstants.LOG_DIR_EXPANSION_VAR}/taskmanager.log""""
    }

    if (hasLogback) {
      tmCommand ++= s" -Dlogback.configurationFile=file:logback.xml"
    }

    if (hasLog4j) {
      tmCommand ++= s" -Dlog4j.configuration=file:log4j.properties"
    }

    tmCommand ++= s" ${classOf[YarnTaskManagerRunner].getName} --configDir . 1> " +
      s"${ApplicationConstants.LOG_DIR_EXPANSION_VAR}/taskmanager-stdout.log 2> " +
      s"${ApplicationConstants.LOG_DIR_EXPANSION_VAR}/taskmanager-stderr.log"

    ctx.setCommands(Collections.singletonList(tmCommand.toString()))

    log.info(s"Starting TM with command=${tmCommand.toString()}")

    ctx.setLocalResources(taskManagerLocalResources.asJava)

    // Setup classpath for container ( = TaskManager )
    val containerEnv = new java.util.HashMap[String, String]()
    Utils.setupEnv(yarnConf, containerEnv)
    containerEnv.put(FlinkYarnClient.ENV_CLIENT_USERNAME, yarnClientUsername)
    ctx.setEnvironment(containerEnv)

    val user = UserGroupInformation.getCurrentUser

    try {
      val credentials = user.getCredentials
      val dob = new DataOutputBuffer()
      credentials.writeTokenStorageToStream(dob)
      val securityTokens = ByteBuffer.wrap(dob.getData, 0, dob.getLength)
      ctx.setTokens(securityTokens)
    } catch {
      case t: Throwable =>
        log.error(t, "Getting current user info failed when trying to launch the container")
    }

    ctx
  }

  private def env = System.getenv()
}
