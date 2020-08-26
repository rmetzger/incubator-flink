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

package org.apache.flink.client;

import org.apache.flink.api.common.JobID;
import org.apache.flink.api.common.JobStatus;
import org.apache.flink.api.common.time.Deadline;
import org.apache.flink.api.common.time.Time;
import org.apache.flink.configuration.BlobServerOptions;
import org.apache.flink.configuration.Configuration;
import org.apache.flink.core.testutils.CommonTestUtils;
import org.apache.flink.runtime.blob.BlobServer;
import org.apache.flink.runtime.blob.VoidBlobStore;
import org.apache.flink.runtime.checkpoint.StandaloneCheckpointRecoveryFactory;
import org.apache.flink.runtime.client.JobInitializationException;
import org.apache.flink.runtime.dispatcher.ArchivedExecutionGraphStore;
import org.apache.flink.runtime.dispatcher.DefaultDispatcherBootstrap;
import org.apache.flink.runtime.dispatcher.DefaultJobManagerRunnerFactory;
import org.apache.flink.runtime.dispatcher.Dispatcher;
import org.apache.flink.runtime.dispatcher.DispatcherGateway;
import org.apache.flink.runtime.dispatcher.DispatcherId;
import org.apache.flink.runtime.dispatcher.DispatcherServices;
import org.apache.flink.runtime.dispatcher.DispatcherTest;
import org.apache.flink.runtime.dispatcher.MemoryArchivedExecutionGraphStore;
import org.apache.flink.runtime.dispatcher.NoOpJobGraphWriter;
import org.apache.flink.runtime.dispatcher.TestingDispatcher;
import org.apache.flink.runtime.dispatcher.VoidHistoryServerArchivist;
import org.apache.flink.runtime.executiongraph.ArchivedExecutionGraph;
import org.apache.flink.runtime.heartbeat.HeartbeatServices;
import org.apache.flink.runtime.highavailability.TestingHighAvailabilityServices;
import org.apache.flink.runtime.jobgraph.JobGraph;
import org.apache.flink.runtime.jobgraph.JobVertex;
import org.apache.flink.runtime.jobmanager.JobGraphWriter;
import org.apache.flink.runtime.leaderelection.TestingLeaderElectionService;
import org.apache.flink.runtime.leaderretrieval.SettableLeaderRetrievalService;
import org.apache.flink.runtime.metrics.groups.UnregisteredMetricGroups;
import org.apache.flink.runtime.resourcemanager.ResourceManagerGateway;
import org.apache.flink.runtime.resourcemanager.utils.TestingResourceManagerGateway;
import org.apache.flink.runtime.rpc.RpcUtils;
import org.apache.flink.runtime.rpc.TestingRpcService;
import org.apache.flink.runtime.testtasks.NoOpInvokable;
import org.apache.flink.runtime.util.TestingFatalErrorHandlerResource;
import org.apache.flink.util.TestLogger;

import org.junit.AfterClass;
import org.junit.Assert;
import org.junit.Before;
import org.junit.BeforeClass;
import org.junit.ClassRule;
import org.junit.Rule;
import org.junit.Test;
import org.junit.rules.TemporaryFolder;

import java.time.Duration;
import java.util.Collections;
import java.util.UUID;
import java.util.concurrent.CompletableFuture;
import java.util.concurrent.ExecutionException;

/**
 * Test for the ClientUtils.
 */
public class ClientUtilsTest extends TestLogger {

	@ClassRule
	public static TemporaryFolder temporaryFolder = new TemporaryFolder();

	private static final JobID TEST_JOB_ID = new JobID();

	private static final Time TIMEOUT = Time.seconds(10L);

	private static TestingRpcService rpcService;

	@Rule
	public final TestingFatalErrorHandlerResource testingFatalErrorHandlerResource = new TestingFatalErrorHandlerResource();

	final HeartbeatServices heartbeatServices = new HeartbeatServices(1000L, 10000L);

	final TestingLeaderElectionService jobMasterLeaderElectionService = new TestingLeaderElectionService();

	final TestingHighAvailabilityServices haServices = new TestingHighAvailabilityServices();

	private BlobServer blobServer;
	private DefaultDispatcherBootstrap dispatcherBootstrap;
	private Configuration configuration;
	private ResourceManagerGateway resourceManagerGateway;
	private ArchivedExecutionGraphStore archivedExecutionGraphStore;
	private JobGraphWriter jobGraphWriter;
	private DefaultJobManagerRunnerFactory jobManagerRunnerFactory;

	@Before
	public void setUp() throws Exception {
		haServices.setJobMasterLeaderElectionService(TEST_JOB_ID, jobMasterLeaderElectionService);
		haServices.setCheckpointRecoveryFactory(new StandaloneCheckpointRecoveryFactory());
		haServices.setResourceManagerLeaderRetriever(new SettableLeaderRetrievalService());

		configuration = new Configuration();

		configuration.setString(
			BlobServerOptions.STORAGE_DIRECTORY,
			temporaryFolder.newFolder().getAbsolutePath());

		blobServer = new BlobServer(configuration, new VoidBlobStore());
		resourceManagerGateway = new TestingResourceManagerGateway();
		archivedExecutionGraphStore = new MemoryArchivedExecutionGraphStore();
		dispatcherBootstrap = new DefaultDispatcherBootstrap(Collections.emptyList());

		jobGraphWriter = NoOpJobGraphWriter.INSTANCE;
		jobManagerRunnerFactory = DefaultJobManagerRunnerFactory.INSTANCE;
	}

	@BeforeClass
	public static void setupClass() {
		rpcService = new TestingRpcService();
	}

	@AfterClass
	public static void teardownClass() throws Exception {
		if (rpcService != null) {
			RpcUtils.terminateRpcService(rpcService, TIMEOUT);

			rpcService = null;
		}
	}

	private TestingDispatcher createAndStartDispatcher() throws Exception {
		final TestingDispatcher dispatcher =
			new TestingDispatcher(
				rpcService,
				DispatcherId.generate(),
				dispatcherBootstrap,
				new DispatcherServices(
					configuration,
					haServices,
					() -> CompletableFuture.completedFuture(resourceManagerGateway),
					blobServer,
					heartbeatServices,
					archivedExecutionGraphStore,
					testingFatalErrorHandlerResource.getFatalErrorHandler(),
					VoidHistoryServerArchivist.INSTANCE,
					null,
					UnregisteredMetricGroups.createUnregisteredJobManagerMetricGroup(),
					jobGraphWriter,
					jobManagerRunnerFactory));
		dispatcher.start();
		jobMasterLeaderElectionService.isLeader(UUID.randomUUID());
		return dispatcher;
	}

	@Test
	public void testWaitUntilJobInitializationFinished_throwsInitializationException() throws
		Exception {
		final JobVertex testVertex = new DispatcherTest.FailingInitializationJobVertex("testVertex");
		testVertex.setInvokableClass(NoOpInvokable.class);

		JobGraph jobGraph = new JobGraph(TEST_JOB_ID, "testJob", testVertex);

		Dispatcher dispatcher = createAndStartDispatcher();
		DispatcherGateway dispatcherGateway = dispatcher.getSelfGateway(DispatcherGateway.class);

		dispatcherGateway.submitJob(jobGraph, TIMEOUT).get();

		CommonTestUtils.assertThrows("Could not instantiate JobManager", JobInitializationException.class, () -> {
			ClientUtils.waitUntilJobInitializationFinished(jobGraph.getJobID(),
				() -> dispatcherGateway.requestJobStatus(jobGraph.getJobID(), TIMEOUT).get(),
				() -> dispatcherGateway.requestJobResult(jobGraph.getJobID(), TIMEOUT).get(),
				ClassLoader.getSystemClassLoader());
			return null;
		});
		CommonTestUtils.assertThrows("Could not instantiate JobManager", ExecutionException.class, () -> {
			dispatcher.closeAsync().get();
			return null;
		});
	}

	@Test
	public void testWaitUntilJobInitializationFinished_doesNotThrowRuntimeException() throws Exception {
		final JobVertex testVertex = new JobVertex("testVertex");
		testVertex.setInvokableClass(NoOpInvokable.class);

		JobGraph jobGraph = new JobGraph(TEST_JOB_ID, "testJob", testVertex);

		TestingDispatcher dispatcher = createAndStartDispatcher();
		DispatcherGateway dispatcherGateway = dispatcher.getSelfGateway(DispatcherGateway.class);

		dispatcherGateway.submitJob(jobGraph, TIMEOUT).get();

		// we don't expect an exception here
		ClientUtils.waitUntilJobInitializationFinished(jobGraph.getJobID(),
			() -> dispatcherGateway.requestJobStatus(jobGraph.getJobID(), TIMEOUT).get(),
			() -> dispatcherGateway.requestJobResult(jobGraph.getJobID(), TIMEOUT).get(),
			ClassLoader.getSystemClassLoader());

		// now "fail" the job
		dispatcher.completeJobExecution(
			ArchivedExecutionGraph.createFromInitializingJob(TEST_JOB_ID, "test", JobStatus.FAILED, new RuntimeException("yolo"), 1337));
		// ensure it is failed
		org.apache.flink.runtime.testutils.CommonTestUtils.waitUntilCondition(() -> {
			JobStatus status = dispatcherGateway.requestJobStatus(
				jobGraph.getJobID(),
				TIMEOUT).get();
			return status == JobStatus.FAILED;
		}, Deadline.fromNow(
			Duration.ofSeconds(10L)), 20L);

		// this is the main test: ensure that this call does not throw an exception:
		ClientUtils.waitUntilJobInitializationFinished(jobGraph.getJobID(),
			() -> dispatcherGateway.requestJobStatus(jobGraph.getJobID(), TIMEOUT).get(),
			() -> dispatcherGateway.requestJobResult(jobGraph.getJobID(), TIMEOUT).get(),
			ClassLoader.getSystemClassLoader());

		ArchivedExecutionGraph archivedExecutionGraph = dispatcherGateway.requestJob(
			TEST_JOB_ID,
			TIMEOUT).get();
		Throwable exception = archivedExecutionGraph.getFailureInfo().getException().deserializeError(
			ClassLoader.getSystemClassLoader());
		Assert.assertTrue(exception instanceof RuntimeException);
	}
}
