/**
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

package org.apache.flink.yarn.appMaster;

import java.io.BufferedReader;
import java.io.BufferedWriter;
import java.io.File;
import java.io.FileInputStream;
import java.io.FileWriter;
import java.io.IOException;
import java.io.InputStreamReader;
import java.io.Writer;
import java.nio.ByteBuffer;
import java.security.PrivilegedAction;
import java.util.Collections;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;
import org.apache.flink.configuration.ConfigConstants;
import org.apache.flink.configuration.GlobalConfiguration;
import org.apache.flink.runtime.ipc.RPC;
import org.apache.flink.runtime.ipc.RPC.Server;
import org.apache.flink.runtime.jobmanager.JobManager;
import org.apache.flink.runtime.util.SerializableArrayList;
import org.apache.flink.types.BooleanValue;
import org.apache.flink.util.StringUtils;
import org.apache.flink.yarn.Client;
import org.apache.flink.yarn.Utils;
import org.apache.flink.yarn.rpc.ApplicationMasterStatus;
import org.apache.flink.yarn.rpc.YARNClientMasterProtocol;
import org.apache.hadoop.conf.Configuration;
import org.apache.hadoop.fs.FileSystem;
import org.apache.hadoop.fs.Path;
import org.apache.hadoop.io.DataOutputBuffer;
import org.apache.hadoop.security.Credentials;
import org.apache.hadoop.security.UserGroupInformation;
import org.apache.hadoop.security.token.Token;
import org.apache.hadoop.security.token.TokenIdentifier;
import org.apache.hadoop.yarn.api.ApplicationConstants;
import org.apache.hadoop.yarn.api.ApplicationConstants.Environment;
import org.apache.hadoop.yarn.api.protocolrecords.AllocateResponse;
import org.apache.hadoop.yarn.api.records.Container;
import org.apache.hadoop.yarn.api.records.ContainerLaunchContext;
import org.apache.hadoop.yarn.api.records.ContainerStatus;
import org.apache.hadoop.yarn.api.records.FinalApplicationStatus;
import org.apache.hadoop.yarn.api.records.LocalResource;
import org.apache.hadoop.yarn.api.records.Priority;
import org.apache.hadoop.yarn.api.records.Resource;
import org.apache.hadoop.yarn.client.api.AMRMClient;
import org.apache.hadoop.yarn.client.api.AMRMClient.ContainerRequest;
import org.apache.hadoop.yarn.client.api.NMClient;
import org.apache.hadoop.yarn.util.Records;

import com.google.common.base.Preconditions;

public class ApplicationMaster implements YARNClientMasterProtocol {

	private static final Log LOG = LogFactory.getLog(ApplicationMaster.class);

	private FileSystem fs;
	private final String currDir;
	private final String logDirs;
	private final String ownHostname;
	private final String appId;
	private final String clientHomeDir;
	private final String applicationMasterHost;
	private final String remoteStratosphereJarPath;
	private final String shipListString;
	private final String yarnClientUsername;
	private final String rpcPort;
	private final int taskManagerCount;
	private final int memoryPerTaskManager;
	private final int coresPerTaskManager;
	private final String localWebInterfaceDir;
	private final Configuration conf;

	private JobManager jobManager;

	private final Server amRpc;

	private AMRMClient<ContainerRequest> rmClient;

	private NMClient nmClient;

	private List<Message> messages = new SerializableArrayList<Message>();

	protected boolean hasLog4j;


	public ApplicationMaster(Configuration conf) throws IOException {
		fs = FileSystem.get(conf);
		Map<String, String> envs = System.getenv();
		currDir = envs.get(Environment.PWD.key());
		logDirs =  envs.get(Environment.LOG_DIRS.key());
		ownHostname = envs.get(Environment.NM_HOST.key());
		appId = envs.get(Client.ENV_APP_ID);
		clientHomeDir = envs.get(Client.ENV_CLIENT_HOME_DIR);
		applicationMasterHost = envs.get(Environment.NM_HOST.key());
		remoteStratosphereJarPath = envs.get(Client.STRATOSPHERE_JAR_PATH);
		shipListString = envs.get(Client.ENV_CLIENT_SHIP_FILES);
		yarnClientUsername = envs.get(Client.ENV_CLIENT_USERNAME);
		rpcPort = envs.get(Client.ENV_AM_PRC_PORT);
		taskManagerCount = Integer.valueOf(envs.get(Client.ENV_TM_COUNT));
		memoryPerTaskManager = Integer.valueOf(envs.get(Client.ENV_TM_MEMORY));
		coresPerTaskManager = Integer.valueOf(envs.get(Client.ENV_TM_CORES));
		localWebInterfaceDir = currDir+"/resources/"+ConfigConstants.DEFAULT_JOB_MANAGER_WEB_PATH_NAME;
		this.conf = conf;

		if(currDir == null) {
			throw new RuntimeException("Current directory unknown");
		}
		if(ownHostname == null) {
			throw new RuntimeException("Own hostname ("+Environment.NM_HOST+") not set.");
		}
		LOG.info("Working directory "+currDir);

		// load Flink configuration.
		Utils.getFlinkConfiguration(currDir);

		// start AM RPC service
		amRpc = RPC.getServer(this, ownHostname, Integer.valueOf(rpcPort), 2);
		amRpc.start();
	}

	private void generateConfigurationFile() throws IOException {
		// Update yaml conf -> set jobManager address to this machine's address.
		FileInputStream fis = new FileInputStream(currDir+"/stratosphere-conf.yaml");
		BufferedReader br = new BufferedReader(new InputStreamReader(fis));
		Writer output = new BufferedWriter(new FileWriter(currDir+"/stratosphere-conf-modified.yaml"));
		String line ;
		while ( (line = br.readLine()) != null) {
			if(line.contains(ConfigConstants.JOB_MANAGER_IPC_ADDRESS_KEY)) {
				output.append(ConfigConstants.JOB_MANAGER_IPC_ADDRESS_KEY+": "+ownHostname+"\n");
			} else if(line.contains(ConfigConstants.JOB_MANAGER_WEB_ROOT_PATH_KEY)) {
				output.append(ConfigConstants.JOB_MANAGER_WEB_ROOT_PATH_KEY+": "+"\n");
			} else {
				output.append(line+"\n");
			}
		}
		// just to make sure.
		output.append(ConfigConstants.JOB_MANAGER_IPC_ADDRESS_KEY+": "+ownHostname+"\n");
		output.append(ConfigConstants.JOB_MANAGER_WEB_ROOT_PATH_KEY+": "+localWebInterfaceDir+"\n");
		output.append(ConfigConstants.JOB_MANAGER_WEB_LOG_PATH_KEY+": "+logDirs+"\n");
		output.close();
		br.close();
		File newConf = new File(currDir+"/stratosphere-conf-modified.yaml");
		if(!newConf.exists()) {
			LOG.warn("modified yaml does not exist!");
		}
	}

	private void startJobManager() throws Exception {
		Utils.copyJarContents("resources/"+ConfigConstants.DEFAULT_JOB_MANAGER_WEB_PATH_NAME,
				ApplicationMaster.class.getProtectionDomain().getCodeSource().getLocation().getPath());

		String pathToNepheleConfig = currDir+"/stratosphere-conf-modified.yaml";
		String[] args = {"-executionMode","cluster", "-configDir", pathToNepheleConfig};

		// start the job manager
		jobManager = JobManager.initialize( args );

		// Start info server for jobmanager
		jobManager.startInfoServer();
	}

	private void setRMClient(AMRMClient<ContainerRequest> rmClient) {
		this.rmClient = rmClient;
	}

	private void run() throws Exception  {

		int heapLimit = Utils.calculateHeapSize(memoryPerTaskManager);

		nmClient = NMClient.createNMClient();
		nmClient.init(conf);
		nmClient.start();
		nmClient.cleanupRunningContainersOnStop(true);

		// Register with ResourceManager
		LOG.info("Registering ApplicationMaster");
		rmClient.registerApplicationMaster(applicationMasterHost, 0, "http://"+applicationMasterHost+":"+GlobalConfiguration.getString(ConfigConstants.JOB_MANAGER_WEB_PORT_KEY, "undefined"));

		// Priority for worker containers - priorities are intra-application
		Priority priority = Records.newRecord(Priority.class);
		priority.setPriority(0);

		// Resource requirements for worker containers
		Resource capability = Records.newRecord(Resource.class);
		capability.setMemory(memoryPerTaskManager);
		capability.setVirtualCores(coresPerTaskManager);

		// Make container requests to ResourceManager
		for (int i = 0; i < taskManagerCount; ++i) {
			ContainerRequest containerAsk = new ContainerRequest(capability,
					null, null, priority);
			LOG.info("Requesting TaskManager container " + i);
			rmClient.addContainerRequest(containerAsk);
		}

		LocalResource stratosphereJar = Records.newRecord(LocalResource.class);
		LocalResource stratosphereConf = Records.newRecord(LocalResource.class);

		// register Stratosphere Jar with remote HDFS
		final Path remoteJarPath = new Path(remoteStratosphereJarPath);
		Utils.registerLocalResource(fs, remoteJarPath, stratosphereJar);

		// register conf with local fs.
		Utils.setupLocalResource(conf, fs, appId, new Path("file://"+currDir+"/stratosphere-conf-modified.yaml"), stratosphereConf, new Path(clientHomeDir));
		LOG.info("Prepared localresource for modified yaml: "+stratosphereConf);


		hasLog4j = new File(currDir+"/log4j.properties").exists();
		// prepare the files to ship
		LocalResource[] remoteShipRsc = null;
		String[] remoteShipPaths = shipListString.split(",");
		if(!shipListString.isEmpty()) {
			remoteShipRsc = new LocalResource[remoteShipPaths.length];
			{ // scope for i
				int i = 0;
				for(String remoteShipPathStr : remoteShipPaths) {
					if(remoteShipPathStr == null || remoteShipPathStr.isEmpty()) {
						continue;
					}
					remoteShipRsc[i] = Records.newRecord(LocalResource.class);
					Path remoteShipPath = new Path(remoteShipPathStr);
					Utils.registerLocalResource(fs, remoteShipPath, remoteShipRsc[i]);
					i++;
				}
			}
		}

		// Obtain allocated containers and launch
		int completedContainers = 0;
		allocateOutstandingContainer();

		LOG.info("Allocated all initial containers");

		// Now wait for containers to complete
		while (completedContainers < taskManagerCount) {
			AllocateResponse response = rmClient.allocate(completedContainers
					/ taskManagerCount);
			for (ContainerStatus status : response.getCompletedContainersStatuses()) {
				++completedContainers;
				LOG.info("Completed container "+status.getContainerId()+". Total Completed:" + completedContainers);
				LOG.info("Diagnostics "+status.getDiagnostics());
				logDeadContainer(status, containerDiag);
			}
			Thread.sleep(5000);
		}
		LOG.info("Shutting down JobManager");
		jobManager.shutdown();

		// Un-register with ResourceManager
		final String diagnosticsMessage = "Application Master shut down after all "
				+ "containers finished\n"+containerDiag.toString();
		LOG.info("Diagnostics message: "+diagnosticsMessage);
		rmClient.unregisterApplicationMaster(FinalApplicationStatus.FAILED, diagnosticsMessage, "");
		nmClient.close();
		rmClient.close();
		LOG.info("Application Master shutdown completed.");
	}

	/**
	 * Run a Thread to allocate new containers until taskManagerCount
	 * is correct again.
	 */
	private void allocateOutstandingContainer() {

		new Thread(new Runnable() {
			@Override
			public void run() {
				// respect custom JVM options in the YAML file
				final String javaOpts = GlobalConfiguration.getString(ConfigConstants.FLINK_JVM_OPTIONS, "");

				int allocatedContainers = 0;
				StringBuffer containerDiag = new StringBuffer(); // diagnostics log for the containers.
				while (allocatedContainers < taskManagerCount) {
					AllocateResponse response = rmClient.allocate(0);
					for (Container container : response.getAllocatedContainers()) {
						LOG.info("Got new Container for TM "+container.getId()+" on host "+container.getNodeId().getHost());
						++allocatedContainers;

						// Launch container by create ContainerLaunchContext
						ContainerLaunchContext ctx = Records.newRecord(ContainerLaunchContext.class);

						String tmCommand = "$JAVA_HOME/bin/java -Xmx"+heapLimit+"m " + javaOpts ;
						if(hasLog4j) {
							tmCommand += " -Dlog.file=\""+ApplicationConstants.LOG_DIR_EXPANSION_VAR +"/taskmanager-log4j.log\" -Dlog4j.configuration=file:log4j.properties";
						}
						tmCommand	+= " eu.stratosphere.yarn.appMaster.YarnTaskManagerRunner -configDir . "
								+ " 1>"
								+ ApplicationConstants.LOG_DIR_EXPANSION_VAR
								+ "/taskmanager-stdout.log"
								+ " 2>"
								+ ApplicationConstants.LOG_DIR_EXPANSION_VAR
								+ "/taskmanager-stderr.log";
						ctx.setCommands(Collections.singletonList(tmCommand));

						LOG.info("Starting TM with command="+tmCommand);

						// copy resources to the TaskManagers.
						Map<String, LocalResource> localResources = new HashMap<String, LocalResource>(2);
						localResources.put("stratosphere.jar", flinkJar);
						localResources.put("stratosphere-conf.yaml", flinkConf);

						// add ship resources
						if(!shipListString.isEmpty()) {
							Preconditions.checkNotNull(remoteShipRsc);
							for( int i = 0; i < remoteShipPaths.length; i++) {
								localResources.put(new Path(remoteShipPaths[i]).getName(), remoteShipRsc[i]);
							}
						}


						ctx.setLocalResources(localResources);

						// Setup CLASSPATH for Container (=TaskTracker)
						Map<String, String> containerEnv = new HashMap<String, String>();
						Utils.setupEnv(conf, containerEnv); //add stratosphere.jar to class path.
						containerEnv.put(Client.ENV_CLIENT_USERNAME, yarnClientUsername);

						ctx.setEnvironment(containerEnv);

						UserGroupInformation user = UserGroupInformation.getCurrentUser();
						try {
							Credentials credentials = user.getCredentials();
							DataOutputBuffer dob = new DataOutputBuffer();
							credentials.writeTokenStorageToStream(dob);
							ByteBuffer securityTokens = ByteBuffer.wrap(dob.getData(),
									0, dob.getLength());
							ctx.setTokens(securityTokens);
						} catch (IOException e) {
							LOG.warn("Getting current user info failed when trying to launch the container", e);
						}

						LOG.info("Launching container " + allocatedContainers);
						nmClient.startContainer(container, ctx);
						messages.add(new Message("Launching new container"));
					}
					for (ContainerStatus status : response.getCompletedContainersStatuses()) {
						++completedContainers;
						LOG.info("Completed container (while allocating) "+status.getContainerId()+". Total Completed:" + completedContainers);
						LOG.info("Diagnostics "+status.getDiagnostics());
						// status.
						logDeadContainer(status, containerDiag);
					}
					Thread.sleep(100);
				}
			}
		});

	}

	private void logDeadContainer(ContainerStatus status,
			StringBuffer containerDiag) {
		String msg = "Diagnostics for containerId="+status.getContainerId()+
				" in state="+status.getState()+"\n"+status.getDiagnostics();
		messages.add(new Message(msg) );
		containerDiag.append("\n\n");
		containerDiag.append(msg);
	}

	public static void main(String[] args) throws Exception {
		// execute Application Master using the client's user
		final String yarnClientUsername = System.getenv(Client.ENV_CLIENT_USERNAME);
		LOG.info("YARN daemon runs as '"+UserGroupInformation.getCurrentUser().getShortUserName()+"' setting"
				+ " user to execute Stratosphere ApplicationMaster/JobManager to '"+yarnClientUsername+"'");
		UserGroupInformation ugi = UserGroupInformation.createRemoteUser(yarnClientUsername);
		for(Token<? extends TokenIdentifier> toks : UserGroupInformation.getCurrentUser().getTokens()) {
			ugi.addToken(toks);
		}
		ugi.doAs(new PrivilegedAction<Object>() {
			@Override
			public Object run() {
				AMRMClient<ContainerRequest> rmClient = null;
				try {
					Configuration conf = Utils.initializeYarnConfiguration();
					rmClient = AMRMClient.createAMRMClient();
					rmClient.init(conf);
					rmClient.start();

					// run the actual Application Master
					ApplicationMaster am = new ApplicationMaster(conf);
					am.generateConfigurationFile();
					am.startJobManager();
					am.setRMClient(rmClient);
					am.run();

				} catch (Throwable e) {
					if(rmClient != null) {
						try {
							rmClient.unregisterApplicationMaster(FinalApplicationStatus.FAILED, "Stratosphere YARN Application master"
									+ " stopped unexpectedly with an exception.\n"
									+ StringUtils.stringifyException(e), "");
						} catch (Exception e1) {
							LOG.fatal("Unable to fail the application master", e1);
						}
					}
					LOG.fatal("Error while running the application master", e);
				}
				return null;
			}
		});
	}

	@Override
	public ApplicationMasterStatus getAppplicationMasterStatus() {
		ApplicationMasterStatus amStatus;
		if(jobManager == null) {
			// JM not yet started
			amStatus= new ApplicationMasterStatus(0, 0, messages.size() );
		} else {
			amStatus = new ApplicationMasterStatus(jobManager.getNumberOfTaskManagers(),
				jobManager.getAvailableSlots(), messages.size() );
		}
		return amStatus;
	}

	@Override
	public BooleanValue shutdownAM() throws Exception {
		LOG.info("Client requested shutdown of AM");
		rmClient.unregisterApplicationMaster(FinalApplicationStatus.SUCCEEDED, "", "");
		nmClient.close();
		rmClient.close();
		return new BooleanValue(true);
	}

	@Override
	public List<Message> getMessages() {
		return messages;
	}

	@Override
	public void addTaskManagers(int n) {
		// TODO Auto-generated method stub

	}
}