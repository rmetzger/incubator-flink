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

import java.io.{File, FileOutputStream}
import java.util.Properties
import java.util.concurrent.TimeUnit

import akka.actor._
import akka.camel.{Consumer, CamelMessage}
import akka.pattern.{ ask, pipe }
import akka.util.Timeout
import org.apache.flink.configuration.{ConfigConstants, GlobalConfiguration}
import org.apache.flink.runtime.ActorLogMessages
import org.apache.flink.runtime.akka.AkkaUtils
import org.apache.flink.runtime.jobmanager.JobManager
import org.apache.flink.runtime.messages.JobManagerMessages.{RequestTotalNumberOfSlots, RequestNumberRegisteredTaskManager}
import org.apache.flink.yarn.Messages._
import org.apache.hadoop.yarn.api.records.{FinalApplicationStatus, YarnApplicationState, ApplicationId}
import org.apache.hadoop.yarn.client.api.YarnClient
import scala.concurrent.Await
import scala.concurrent.duration._

class ApplicationClientImpl(appId: ApplicationId, jobManagerPort: Int, yarnClient: YarnClient,
                        confDirPath: String, slots: Int, numTaskManagers: Int,
                        dynamicPropertiesEncoded: String)

  extends Actor with ActorLogMessages with ActorLogging with ApplicationClient {
  import context._

  val INITIAL_POLLING_DELAY = 0 seconds
  val WAIT_FOR_YARN_INTERVAL = 500 milliseconds
  val POLLING_INTERVAL = 3 seconds

  var applicationMaster: Option[ActorRef] = None
  var pollingTimer: Option[Cancellable] = None
  implicit var timeout: FiniteDuration = 0 seconds
  var running = false

  override def preStart(): Unit = {
    super.preStart()

    // permanently? schedule a yarn poll report
    pollingTimer = Some(context.system.scheduler.schedule(INITIAL_POLLING_DELAY,
      WAIT_FOR_YARN_INTERVAL, self, PollYarnReport))

    timeout = new FiniteDuration(GlobalConfiguration.getInteger(ConfigConstants.AKKA_ASK_TIMEOUT,
      ConfigConstants.DEFAULT_AKKA_ASK_TIMEOUT), TimeUnit.SECONDS)
  }

  override def postStop(): Unit = {
    log.info("Stopped Application client.")
    pollingTimer foreach {
      _.cancel()
    }

    pollingTimer = None
  }

  override def receiveWithLogMessages: Receive = {
    // request the number of task managers and slots from the job manager
    case PollYarnReport => {
        applicationMaster.get ! RequestNumberRegisteredTaskManager
        applicationMaster.get ! RequestTotalNumberOfSlots
      }
      case _ =>
    }

  /*  case msg: YarnMessage => {
      println(msg)
    } */
    /*case msg: StopYarnSession => {
      log.info("Stop yarn session.")
      jobManager foreach {
        _ forward msg
      }
    }
    case msg: CamelMessage => {
      msg.bodyAs[String] match {
        case "stop" | "quit" | "exit" => self ! StopYarnSession(FinalApplicationStatus.KILLED)
        case "help" => printHelp
        case msg => println(s"Unknown command ${msg}.")
      }
    } */

  // method defined in ApplicationClient interface.
  override def stopCluster(status: FinalApplicationStatus) = {
    implicit val to = Timeout.durationToTimeout(timeout)
    val future = applicationMaster.get ask StopYarnSession(status)
    Await.result(future, timeout)

    pollingTimer foreach {
      _ cancel()
    }

    akka.japi.Option.some(true)
  }
}
