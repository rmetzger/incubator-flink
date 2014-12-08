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
package org.apache.flink.yarn;

import java.io.ByteArrayOutputStream;
import java.io.File;
import java.io.IOException;
import java.io.PrintStream;
import java.net.InetAddress;
import java.net.InetSocketAddress;
import java.util.Collections;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.concurrent.TimeUnit;

import akka.actor.ActorRef;
import akka.actor.ActorSystem;
import akka.actor.TypedActor;
import akka.actor.TypedProps;
import akka.japi.Creator;
import org.apache.flink.client.FlinkYarnSessionCli;
import org.apache.flink.runtime.yarn.AbstractFlinkYarnClient;
import org.apache.flink.runtime.yarn.AbstractFlinkYarnCluster;
import org.apache.hadoop.yarn.api.records.ApplicationReport;
import org.apache.hadoop.yarn.api.records.FinalApplicationStatus;
import org.apache.hadoop.yarn.api.records.YarnApplicationState;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.apache.flink.configuration.ConfigConstants;
import org.apache.flink.configuration.GlobalConfiguration;
import org.apache.hadoop.conf.Configuration;
import org.apache.hadoop.fs.FileSystem;
import org.apache.hadoop.fs.Path;
import org.apache.hadoop.fs.permission.FsAction;
import org.apache.hadoop.fs.permission.FsPermission;
import org.apache.hadoop.security.UserGroupInformation;
import org.apache.hadoop.yarn.api.ApplicationConstants;
import org.apache.hadoop.yarn.api.protocolrecords.GetNewApplicationResponse;
import org.apache.hadoop.yarn.api.records.ApplicationId;
import org.apache.hadoop.yarn.api.records.ApplicationSubmissionContext;
import org.apache.hadoop.yarn.api.records.ContainerLaunchContext;
import org.apache.hadoop.yarn.api.records.LocalResource;
import org.apache.hadoop.yarn.api.records.NodeReport;
import org.apache.hadoop.yarn.api.records.NodeState;
import org.apache.hadoop.yarn.api.records.QueueInfo;
import org.apache.hadoop.yarn.api.records.Resource;
import org.apache.hadoop.yarn.api.records.YarnClusterMetrics;
import org.apache.hadoop.yarn.client.api.YarnClient;
import org.apache.hadoop.yarn.client.api.YarnClientApplication;
import org.apache.hadoop.yarn.exceptions.YarnException;
import org.apache.hadoop.yarn.util.Records;

/**
 * All classes in this package contain code taken from
 * https://github.com/apache/hadoop-common/blob/trunk/hadoop-yarn-project/hadoop-yarn/hadoop-yarn-applications/hadoop-yarn-applications-distributedshell/src/main/java/org/apache/hadoop/yarn/applications/distributedshell/Client.java?source=cc
 * and
 * https://github.com/hortonworks/simple-yarn-app
 * and
 * https://github.com/yahoo/storm-yarn/blob/master/src/main/java/com/yahoo/storm/yarn/StormOnYarn.java
 *
 * The Flink jar is uploaded to HDFS by this client.
 * The application master and all the TaskManager containers get the jar file downloaded
 * by YARN into their local fs.
 *
 */
public class FlinkYarnClient extends AbstractFlinkYarnClient {
	private static final Logger LOG = LoggerFactory.getLogger(FlinkYarnClient.class);


	/**
	 * Constants,
	 * all starting with ENV_ are used as environment variables to pass values from the Client
	 * to the Application Master.
	 */
	public final static String ENV_TM_MEMORY = "_CLIENT_TM_MEMORY";
	public final static String ENV_TM_COUNT = "_CLIENT_TM_COUNT";
	public final static String ENV_APP_ID = "_APP_ID";
	public final static String ENV_APP_NUMBER = "_APP_NUMBER";
	public final static String FLINK_JAR_PATH = "_FLINK_JAR_PATH"; // the Flink jar resource location (in HDFS).
	public static final String ENV_CLIENT_HOME_DIR = "_CLIENT_HOME_DIR";
	public static final String ENV_CLIENT_SHIP_FILES = "_CLIENT_SHIP_FILES";
	public static final String ENV_CLIENT_USERNAME = "_CLIENT_USERNAME";
	public static final String ENV_SLOTS = "_SLOTS";
	public static final String ENV_DYNAMIC_PROPERTIES = "_DYNAMIC_PROPERTIES";


	/**
	 * Minimum memory requirements, checked by the Client.
	 */
	private static final int MIN_JM_MEMORY = 128;
	private static final int MIN_TM_MEMORY = 128;

	private Configuration conf;
	private YarnClient yarnClient;
	private YarnClientApplication yarnApplication;


	/**
	 * Files (usually in a distributed file system) used for the YARN session of Flink.
	 * Contains configuration files and jar files.
	 */
	private Path sessionFilesDir;

	/**
	 * If the user has specified a different number of slots, we store them here
	 */
	private int slots = -1;

	private int jobManagerMemoryMb = 512;

	private int taskManagerMemoryMb = 512;

	private int taskManagerCount = 1;

	private String yarnQueue;

	private String configurationDirectory;

	private Path flinkConfigurationPath;

	private Path flinkLoggingConfigurationPath; // optional

	private Path flinkJarPath;

	private String dynamicPropertiesEncoded;

	private List<File> shipFiles;


	public FlinkYarnClient() {
		// Check if security is enabled
		if(UserGroupInformation.isSecurityEnabled()) {
			throw new RuntimeException("Flink YARN client does not have security support right now."
					+ "File a bug, we will fix it asap");
		}
		conf = Utils.initializeYarnConfiguration();
		if(this.yarnClient == null) {
			// Create yarnClient
			yarnClient = YarnClient.createYarnClient();
			yarnClient.init(conf);
			yarnClient.start();
		}
	}

	@Override
	public void setJobManagerMemory(int memoryMb) {
		if(memoryMb < MIN_JM_MEMORY) {
			throw new IllegalArgumentException("The JobManager memory is below the minimum required memory amount "
					+ "of "+MIN_JM_MEMORY+" MB");
		}
		this.jobManagerMemoryMb = memoryMb;
	}

	@Override
	public void setTaskManagerMemory(int memoryMb) {
		if(memoryMb < MIN_TM_MEMORY) {
			throw new IllegalArgumentException("The TaskManager memory is below the minimum required memory amount "
					+ "of "+MIN_TM_MEMORY+" MB");
		}
		this.taskManagerMemoryMb = memoryMb;
	}

	@Override
	public void setTaskManagerSlots(int slots) {
		if(slots <= 0) {
			throw new IllegalArgumentException("Number of TaskManager slots must be positive");
		}
		this.slots = slots;
	}

	@Override
	public int getTaskManagerSlots() {
		return this.slots;
	}

	@Override
	public void setQueue(String queue) {
		this.yarnQueue = queue;
	}

	@Override
	public void setLocalJarPath(Path localJarPath) {
		this.flinkJarPath = localJarPath;
	}

	@Override
	public void setConfigurationFilePath(Path confPath) {
		flinkConfigurationPath = confPath;
	}

	public void setConfigurationDirectory(String configurationDirectory) {
		this.configurationDirectory = configurationDirectory;
	}

	@Override
	public void setFlinkLoggingConfigurationPath(Path logConfPath) {
		flinkLoggingConfigurationPath = logConfPath;
	}

	@Override
	public Path getFlinkLoggingConfigurationPath() {
		return flinkLoggingConfigurationPath;
	}

	@Override
	public void setTaskManagerCount(int tmCount) {
		if(tmCount < 1) {
			throw new IllegalArgumentException("The TaskManager count has to be at least 1.");
		}
		this.taskManagerCount = tmCount;
	}

	@Override
	public int getTaskManagerCount() {
		return this.taskManagerCount;
	}

	@Override
	public void setShipFiles(List<File> shipFiles) {
		this.shipFiles = shipFiles;
	}

	public void setDynamicPropertiesEncoded(String dynamicPropertiesEncoded) {
		this.dynamicPropertiesEncoded = dynamicPropertiesEncoded;
	}

	@Override
	public String getDynamicPropertiesEncoded() {
		return this.dynamicPropertiesEncoded;
	}


	/**
	 * This method will block until the ApplicationMaster/JobManager have been
	 * deployed on YARN.
	 */
	@Override
	public AbstractFlinkYarnCluster deploy(String clusterName) throws Exception {

		LOG.info("Using values:");
		LOG.info("\tTaskManager count = " + taskManagerCount);
		LOG.info("\tJobManager memory = " + jobManagerMemoryMb);
		LOG.info("\tTaskManager memory = " + taskManagerMemoryMb);

		// Create application via yarnClient
		yarnApplication = yarnClient.createApplication();
		GetNewApplicationResponse appResponse = yarnApplication.getNewApplicationResponse();


		// ------------------ Check if the YARN Cluster has the requested resources --------------

		Resource maxRes = appResponse.getMaximumResourceCapability();
		if(jobManagerMemoryMb > maxRes.getMemory() ) {
			failSessionDuringDeployment();
			throw new YarnDeploymentException("The cluster does not have the requested resources for the JobManager available!\n"
					+ "Maximum Memory: "+maxRes.getMemory());
		}

		if(taskManagerMemoryMb > maxRes.getMemory() ) {
			failSessionDuringDeployment();
			throw new YarnDeploymentException("The cluster does not have the requested resources for the TaskManagers available!\n"
					+ "Maximum Memory: " + maxRes.getMemory());
		}


		int totalMemoryRequired = jobManagerMemoryMb + taskManagerMemoryMb * taskManagerCount;
		ClusterResourceDescription freeClusterMem = getCurrentFreeClusterResources(yarnClient);
		if(freeClusterMem.totalFreeMemory < totalMemoryRequired) {
			failSessionDuringDeployment();
			throw new YarnDeploymentException("This YARN session requires " + totalMemoryRequired + "MB of memory in the cluster. "
					+ "There are currently only " + freeClusterMem.totalFreeMemory+"MB available.");

		}
		if( taskManagerMemoryMb > freeClusterMem.containerLimit) {
			failSessionDuringDeployment();
			LOG.error("The requested amount of memory for the TaskManagers ("+taskManagerMemoryMb+"MB) is more than "
					+ "the largest possible YARN container: "+freeClusterMem.containerLimit);
		}
		if( jobManagerMemoryMb > freeClusterMem.containerLimit) {
			failSessionDuringDeployment();
			LOG.error("The requested amount of memory for the JobManager ("+jobManagerMemoryMb+"MB) is more than "
					+ "the largest possible YARN container: "+freeClusterMem.containerLimit);
		}

		// the yarnMinAllocationMB specifies the smallest possible container allocation size.
		// all allocations below this value are automatically set to this value.
		final int yarnMinAllocationMB = conf.getInt("yarn.scheduler.minimum-allocation-mb", 0);
		if(jobManagerMemoryMb < yarnMinAllocationMB || taskManagerMemoryMb < yarnMinAllocationMB) {
			LOG.warn("The JobManager or TaskManager memory is below the smallest possible YARN Container size. "
					+ "The value of 'yarn.scheduler.minimum-allocation-mb' is '"+yarnMinAllocationMB+"'. Please increase the memory size." +
					"YARN will allocate the smaller containers but the scheduler will account for the minimum-allocation-mb, maybe not all instances " +
					"you requested will start.");
		}

		// ------------------ Prepare Application Master Container  ------------------------------

		// respect custom JVM options in the YAML file
		final String javaOpts = GlobalConfiguration.getString(ConfigConstants.FLINK_JVM_OPTIONS, "");

		boolean hasLogback = Utils.hasLogback(configurationDirectory + File.separator + FlinkYarnSessionCli.CONFIG_FILE_LOGBACK_NAME);
		boolean hasLog4j = Utils.hasLog4j(configurationDirectory + File.separator + FlinkYarnSessionCli.CONFIG_FILE_LOG4J_NAME);

		2. NEXT STEPS:
		- Don't delete hdfs files once the cluster is shutting down (Just for debuggin)
		- make shure that we ship the log4j and logback configuration files

		Once that is working, I can further invesitage:
		a) why the client is not able to correctly connect (may be resolveD)
		b) why taskmanagers are not connecting to the jobmhr

		// Set up the container launch context for the application master
		ContainerLaunchContext amContainer = Records
				.newRecord(ContainerLaunchContext.class);

		String amCommand = "$JAVA_HOME/bin/java"
					+ " -Xmx"+Utils.calculateHeapSize(jobManagerMemoryMb)+"M " +javaOpts;

		if(hasLogback || hasLog4j) {
			amCommand += " -Dlog.file=\""+ApplicationConstants.LOG_DIR_EXPANSION_VAR +"/jobmanager-main.log\"";
		}

		if(hasLogback) {
			amCommand += " -Dlogback.configurationFile=file:" + FlinkYarnSessionCli.CONFIG_FILE_LOGBACK_NAME;
		}
		if(hasLog4j) {
			amCommand += " -Dlog4j.configuration=file:" + FlinkYarnSessionCli.CONFIG_FILE_LOG4J_NAME;
		}

		amCommand 	+= " "+ApplicationMaster.class.getName()+" "
					+ " 1>"
					+ ApplicationConstants.LOG_DIR_EXPANSION_VAR + "/jobmanager-stdout.log"
					+ " 2>" + ApplicationConstants.LOG_DIR_EXPANSION_VAR + "/jobmanager-stderr.log";
		amContainer.setCommands(Collections.singletonList(amCommand));

		LOG.debug("Application Master start command: "+amCommand);

		// intialize HDFS
		// Copy the application master jar to the filesystem
		// Create a local resource to point to the destination jar path
		final FileSystem fs = FileSystem.get(conf);

		// hard coded check for the GoogleHDFS client because its not overriding the getScheme() method.
		if( !fs.getClass().getSimpleName().equals("GoogleHadoopFileSystem") &&
				fs.getScheme().startsWith("file")) {
			LOG.warn("The file system scheme is '" + fs.getScheme() + "'. This indicates that the "
					+ "specified Hadoop configuration path is wrong and the sytem is using the default Hadoop configuration values."
					+ "The Flink YARN client needs to store its files in a distributed file system");
		}

		// Set-up ApplicationSubmissionContext for the application
		ApplicationSubmissionContext appContext = yarnApplication.getApplicationSubmissionContext();
		final ApplicationId appId = appContext.getApplicationId();

		int appNumber = appId.getId();

		// Setup jar for ApplicationMaster
		LocalResource appMasterJar = Records.newRecord(LocalResource.class);
		LocalResource flinkConf = Records.newRecord(LocalResource.class);
		Path remotePathJar = Utils.setupLocalResource(conf, fs, appId.toString(), flinkJarPath, appMasterJar, fs.getHomeDirectory());
		Path remotePathConf = Utils.setupLocalResource(conf, fs, appId.toString(), flinkConfigurationPath, flinkConf, fs.getHomeDirectory());
		Map<String, LocalResource> localResources = new HashMap<String, LocalResource>(2);
		localResources.put("flink.jar", appMasterJar);
		localResources.put("flink-conf.yaml", flinkConf);


		// setup security tokens (code from apache storm)
		final Path[] paths = new Path[3 + shipFiles.size()];
		StringBuffer envShipFileList = new StringBuffer();
		// upload ship files
		for (int i = 0; i < shipFiles.size(); i++) {
			File shipFile = shipFiles.get(i);
			LocalResource shipResources = Records.newRecord(LocalResource.class);
			Path shipLocalPath = new Path("file://" + shipFile.getAbsolutePath());
			paths[3 + i] = Utils.setupLocalResource(conf, fs, appId.toString(),
					shipLocalPath, shipResources, fs.getHomeDirectory());
			localResources.put(shipFile.getName(), shipResources);

			envShipFileList.append(paths[3 + i]);
			if(i+1 < shipFiles.size()) {
				envShipFileList.append(',');
			}
		}

		paths[0] = remotePathJar;
		paths[1] = remotePathConf;
		sessionFilesDir = new Path(fs.getHomeDirectory(), ".flink/" + appId.toString() + "/");
		FsPermission permission = new FsPermission(FsAction.ALL, FsAction.ALL, FsAction.ALL);
		fs.setPermission(sessionFilesDir, permission); // set permission for path.
		Utils.setTokensFor(amContainer, paths, this.conf);


		amContainer.setLocalResources(localResources);
		fs.close();

		// Setup CLASSPATH for ApplicationMaster
		Map<String, String> appMasterEnv = new HashMap<String, String>();
		Utils.setupEnv(conf, appMasterEnv);
		// set configuration values
		appMasterEnv.put(FlinkYarnClient.ENV_TM_COUNT, String.valueOf(taskManagerCount));
		appMasterEnv.put(FlinkYarnClient.ENV_TM_MEMORY, String.valueOf(taskManagerMemoryMb));
		appMasterEnv.put(FlinkYarnClient.FLINK_JAR_PATH, remotePathJar.toString() );
		appMasterEnv.put(FlinkYarnClient.ENV_APP_ID, appId.toString());
		appMasterEnv.put(FlinkYarnClient.ENV_CLIENT_HOME_DIR, fs.getHomeDirectory().toString());
		appMasterEnv.put(FlinkYarnClient.ENV_CLIENT_SHIP_FILES, envShipFileList.toString() );
		appMasterEnv.put(FlinkYarnClient.ENV_CLIENT_USERNAME, UserGroupInformation.getCurrentUser().getShortUserName());
		appMasterEnv.put(FlinkYarnClient.ENV_SLOTS, String.valueOf(slots));
		appMasterEnv.put(FlinkYarnClient.ENV_APP_NUMBER, String.valueOf(appNumber));
		if(dynamicPropertiesEncoded != null) {
			appMasterEnv.put(FlinkYarnClient.ENV_DYNAMIC_PROPERTIES, dynamicPropertiesEncoded);
		}

		amContainer.setEnvironment(appMasterEnv);

		// Set up resource type requirements for ApplicationMaster
		Resource capability = Records.newRecord(Resource.class);
		capability.setMemory(jobManagerMemoryMb);
		capability.setVirtualCores(1);

		if(clusterName == null) {
			clusterName = "Flink session with "+taskManagerCount+" TaskManagers";
		}

		appContext.setApplicationName(clusterName); // application name
		appContext.setApplicationType("Apache Flink");
		appContext.setAMContainerSpec(amContainer);
		appContext.setResource(capability);
		appContext.setQueue(yarnQueue);


		LOG.info("Submitting application master " + appId);
		yarnClient.submitApplication(appContext);

		LOG.info("Waiting for the cluster to be allocated");
		loop: while( true ) {
			ApplicationReport report = yarnClient.getApplicationReport(appId);
			YarnApplicationState appState = report.getYarnApplicationState();
			switch(appState) {
				case FAILED:
				case FINISHED:
				case KILLED:
					throw new YarnDeploymentException("The YARN application unexpectedly switched to state "
							+ appState +" during deployment. \n" +
							"Diagnostics from YARN: "+report.getDiagnostics() + "\n" +
							"If log aggregation is enabled on your cluster, use this command to further invesitage the issue:\n" +
							"yarn logs -applicationId "+appId);
					//break ..
				case RUNNING:
					LOG.info("YARN application has been deployed successfully.");
					break loop;
				default:
					LOG.info("Deploying cluster, current state "+appState);

			}
			Thread.sleep(500);
		}
		// the Flink cluster is deployed in YARN. Represent cluster
		return new FlinkYarnCluster(yarnClient, appId, conf, sessionFilesDir);
	}

	/**
	 * Kills YARN application and stops YARN client.
	 *
	 * Use this method to kill the App before it has been properly deployed
	 */
	private void failSessionDuringDeployment() {
		LOG.info("Killing YARN application");
		try {
			yarnClient.killApplication(yarnApplication.getNewApplicationResponse().getApplicationId());
		} catch (Exception e) {
			LOG.error("Error while killing YARN application", e);
		}
		yarnClient.stop();
	}


	private static class ClusterResourceDescription {
		public int totalFreeMemory;
		public int containerLimit;
	}

	private ClusterResourceDescription getCurrentFreeClusterResources(YarnClient yarnClient) throws YarnException, IOException {
		ClusterResourceDescription crd = new ClusterResourceDescription();
		crd.totalFreeMemory = 0;
		crd.containerLimit = 0;
		List<NodeReport> nodes = yarnClient.getNodeReports(NodeState.RUNNING);
		for(NodeReport rep : nodes) {
			int free = rep.getCapability().getMemory() - (rep.getUsed() != null ? rep.getUsed().getMemory() : 0 );
			crd.totalFreeMemory += free;
			if(free > crd.containerLimit) {
				crd.containerLimit = free;
			}
		}
		return crd;
	}



	public String getClusterDescription() throws Exception {

		ByteArrayOutputStream baos = new ByteArrayOutputStream();
		PrintStream ps = new PrintStream(baos);

		YarnClusterMetrics metrics = yarnClient.getYarnClusterMetrics();

		ps.append("NodeManagers in the Cluster " + metrics.getNumNodeManagers());
		List<NodeReport> nodes = yarnClient.getNodeReports(NodeState.RUNNING);
		final String format = "|%-16s |%-16s %n";
		ps.printf("|Property         |Value          %n");
		ps.println("+---------------------------------------+");
		int totalMemory = 0;
		int totalCores = 0;
		for(NodeReport rep : nodes) {
			final Resource res = rep.getCapability();
			totalMemory += res.getMemory();
			totalCores += res.getVirtualCores();
			ps.format(format, "NodeID", rep.getNodeId());
			ps.format(format, "Memory", res.getMemory()+" MB");
			ps.format(format, "vCores", res.getVirtualCores());
			ps.format(format, "HealthReport", rep.getHealthReport());
			ps.format(format, "Containers", rep.getNumContainers());
			ps.println("+---------------------------------------+");
		}
		ps.println("Summary: totalMemory "+totalMemory+" totalCores "+totalCores);
		List<QueueInfo> qInfo = yarnClient.getAllQueues();
		for(QueueInfo q : qInfo) {
			ps.println("Queue: "+q.getQueueName()+", Current Capacity: "+q.getCurrentCapacity()+" Max Capacity: "+q.getMaximumCapacity()+" Applications: "+q.getApplications().size());
		}
		yarnClient.stop();
		return baos.toString();
	}

	public static class YarnDeploymentException extends RuntimeException {
		public YarnDeploymentException() {
		}

		public YarnDeploymentException(String message) {
			super(message);
		}

		public YarnDeploymentException(String message, Throwable cause) {
			super(message, cause);
		}
	}

}
