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

import akka.actor.ActorRef;
import akka.actor.ActorSystem;
import akka.actor.TypedActor;
import akka.actor.TypedProps;
import akka.japi.Creator;
import org.apache.flink.configuration.GlobalConfiguration;
import org.apache.flink.runtime.yarn.AbstractFlinkYarnCluster;
import org.apache.hadoop.conf.Configuration;
import org.apache.hadoop.fs.FileSystem;
import org.apache.hadoop.fs.Path;
import org.apache.hadoop.yarn.api.records.ApplicationId;
import org.apache.hadoop.yarn.api.records.ApplicationReport;
import org.apache.hadoop.yarn.api.records.FinalApplicationStatus;
import org.apache.hadoop.yarn.api.records.YarnApplicationState;
import org.apache.hadoop.yarn.client.api.YarnClient;
import org.apache.hadoop.yarn.exceptions.YarnException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.io.IOException;
import java.net.InetSocketAddress;


public class FlinkYarnCluster extends AbstractFlinkYarnCluster {
	private static final Logger LOG = LoggerFactory.getLogger(FlinkYarnCluster.class);

	private YarnClient yarnClient;
	private Thread clusterRunner;
	private Configuration hadoopConfig;
	// (HDFS) location of the files required to run on YARN. Needed here to delete them on shutdown.
	private Path sessionFilesDir;
	private InetSocketAddress jobManagerAddress;

	//---------- Class internal fields -------------------

	private ActorSystem actorSystem;
	private ApplicationClient applicationClient;
	private ApplicationReport intialAppReport;

	public FlinkYarnCluster(final YarnClient yarnClient, final ApplicationId appId,
							Configuration hadoopConfig, Path sessionFilesDir) throws IOException, YarnException {
		this.yarnClient = yarnClient;
		this.hadoopConfig = hadoopConfig;
		this.sessionFilesDir = sessionFilesDir;

		// get one application report manually
		intialAppReport = yarnClient.getApplicationReport(appId);
		String jobManagerHost = intialAppReport.getHost();
		int jobManagerPort = intialAppReport.getRpcPort();
		this.jobManagerAddress = new InetSocketAddress(jobManagerHost, jobManagerPort);

		// start actor system
		LOG.info("Start actor system.");
		actorSystem = YarnUtils.createActorSystem(jobManagerHost, jobManagerPort, GlobalConfiguration.getConfiguration());

		// start application client
		LOG.info("Start application client.");

		applicationClient = TypedActor.get(actorSystem).typedActorOf(
			new TypedProps<ApplicationClientImpl>(ApplicationClient.class,
				new Creator<ApplicationClientImpl>() {
					@Override
					public ApplicationClientImpl create() throws Exception {
						return new ApplicationClientImpl(null, 0, null, null, 0, 0, null);
					}
				}));

		// add hook to ensure proper shutdown
		Runtime.getRuntime().addShutdownHook(new ClientShutdownHook());

		clusterRunner = new Thread(new Runnable() {
			@Override
			public void run() {
				// blocks until ApplicationMaster has been stopped
				actorSystem.awaitTermination();

				// get final application report
				try {
					ApplicationReport appReport = yarnClient.getApplicationReport(appId);

					LOG.info("Application " + appId + " finished with state " + appReport
							.getYarnApplicationState() + " and final state " + appReport
							.getFinalApplicationStatus() + " at " + appReport.getFinishTime());

					if(appReport.getYarnApplicationState() == YarnApplicationState.FAILED || appReport.getYarnApplicationState()
							== YarnApplicationState.KILLED	) {
						LOG.warn("Application failed. Diagnostics "+appReport.getDiagnostics());
						LOG.warn("If log aggregation is activated in the Hadoop cluster, we recommend to retrieve "
								+ "the full application log using this command:\n"
								+ "\tyarn logs -applicationId "+appReport.getApplicationId()+"\n"
								+ "(It sometimes takes a few seconds until the logs are aggregated)");
					}
				} catch(Exception e) {
					LOG.warn("Error while getting final application report", e);
				}
			}
		});
		clusterRunner.setDaemon(true);
		clusterRunner.start();
	}

	@Override
	public InetSocketAddress getJobManagerAddress() {
		return jobManagerAddress;
	}

	@Override
	public String getWebInterfaceURL() {
		return this.intialAppReport.getTrackingUrl();
	}

	// -------------------------- Shutdown handling ------------------------

	@Override
	public void shutdown() {
		if(actorSystem != null){
			LOG.info("Sending shutdown request to the Application Master");
			if(applicationClient != null) {
				/*applicationClient.tell(new Messages.StopYarnSession(FinalApplicationStatus.KILLED),
						ActorRef.noSender()); */
				applicationClient.stopCluster();
				applicationClient = null;
			}

			actorSystem.shutdown();
			actorSystem.awaitTermination();

			actorSystem = null;
		}

		LOG.info("Deleting files in "+sessionFilesDir );
		try {
			FileSystem shutFS = FileSystem.get(hadoopConfig);
			shutFS.delete(sessionFilesDir, true); // delete conf and jar file.
			shutFS.close();
		}catch(IOException e){
			LOG.error("Could not delete the Flink jar and configuration files in HDFS..", e);
		}

		try {
			clusterRunner.join(1000); // wait for 1 second
		} catch (InterruptedException e) {
			LOG.warn("Shutdown of the cluster runner was interrupted", e);
			Thread.currentThread().interrupt();
		}

		LOG.info("YARN Client is shutting down");
		yarnClient.stop(); // clusterRunner is using the yarnClient.
		yarnClient = null; // set null to clearly see if somebody wants to access it afterwards.
	}

	public class ClientShutdownHook extends Thread {
		@Override
		public void run() {
			shutdown();
		}
	}
}
