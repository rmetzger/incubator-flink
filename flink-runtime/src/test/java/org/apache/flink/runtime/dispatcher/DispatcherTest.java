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

package org.apache.flink.runtime.dispatcher;

import org.apache.flink.api.common.JobID;
import org.apache.flink.api.common.JobStatus;
import org.apache.flink.api.common.operators.ResourceSpec;
import org.apache.flink.api.common.time.Deadline;
import org.apache.flink.api.common.time.Time;
import org.apache.flink.configuration.BlobServerOptions;
import org.apache.flink.configuration.Configuration;
import org.apache.flink.core.testutils.OneShotLatch;
import org.apache.flink.runtime.blob.BlobServer;
import org.apache.flink.runtime.blob.VoidBlobStore;
import org.apache.flink.runtime.checkpoint.Checkpoints;
import org.apache.flink.runtime.checkpoint.StandaloneCheckpointRecoveryFactory;
import org.apache.flink.runtime.checkpoint.metadata.CheckpointMetadata;
import org.apache.flink.runtime.client.JobSubmissionException;
import org.apache.flink.runtime.executiongraph.ArchivedExecutionGraph;
import org.apache.flink.runtime.executiongraph.ErrorInfo;
import org.apache.flink.runtime.heartbeat.HeartbeatServices;
import org.apache.flink.runtime.highavailability.HighAvailabilityServices;
import org.apache.flink.runtime.highavailability.TestingHighAvailabilityServices;
import org.apache.flink.runtime.jobgraph.JobGraph;
import org.apache.flink.runtime.jobgraph.JobVertex;
import org.apache.flink.runtime.jobmanager.JobGraphWriter;
import org.apache.flink.runtime.jobmaster.JobManagerRunner;
import org.apache.flink.runtime.jobmaster.JobManagerSharedServices;
import org.apache.flink.runtime.jobmaster.JobMasterGateway;
import org.apache.flink.runtime.jobmaster.JobNotFinishedException;
import org.apache.flink.runtime.jobmaster.JobResult;
import org.apache.flink.runtime.jobmaster.TestingJobManagerRunner;
import org.apache.flink.runtime.jobmaster.factories.JobManagerJobMetricGroupFactory;
import org.apache.flink.runtime.jobmaster.utils.TestingJobMasterGateway;
import org.apache.flink.runtime.jobmaster.utils.TestingJobMasterGatewayBuilder;
import org.apache.flink.runtime.leaderelection.TestingLeaderElectionService;
import org.apache.flink.runtime.leaderretrieval.SettableLeaderRetrievalService;
import org.apache.flink.runtime.messages.Acknowledge;
import org.apache.flink.runtime.messages.FlinkJobNotFoundException;
import org.apache.flink.runtime.messages.webmonitor.MultipleJobsDetails;
import org.apache.flink.runtime.metrics.groups.UnregisteredMetricGroups;
import org.apache.flink.runtime.resourcemanager.utils.TestingResourceManagerGateway;
import org.apache.flink.runtime.rest.handler.legacy.utils.ArchivedExecutionGraphBuilder;
import org.apache.flink.runtime.rpc.FatalErrorHandler;
import org.apache.flink.runtime.rpc.RpcService;
import org.apache.flink.runtime.rpc.RpcUtils;
import org.apache.flink.runtime.rpc.TestingRpcService;
import org.apache.flink.runtime.state.CheckpointMetadataOutputStream;
import org.apache.flink.runtime.state.CheckpointStorageCoordinatorView;
import org.apache.flink.runtime.state.CheckpointStorageLocation;
import org.apache.flink.runtime.state.CompletedCheckpointStorageLocation;
import org.apache.flink.runtime.state.StateBackend;
import org.apache.flink.runtime.testtasks.NoOpInvokable;
import org.apache.flink.runtime.testutils.CommonTestUtils;
import org.apache.flink.runtime.testutils.TestingJobGraphStore;
import org.apache.flink.runtime.util.TestingFatalErrorHandler;
import org.apache.flink.runtime.util.TestingFatalErrorHandlerResource;
import org.apache.flink.util.ExceptionUtils;
import org.apache.flink.util.FlinkException;
import org.apache.flink.util.TestLogger;
import org.apache.flink.util.function.ThrowingRunnable;

import org.hamcrest.Matchers;
import org.junit.After;
import org.junit.AfterClass;
import org.junit.Assert;
import org.junit.Before;
import org.junit.BeforeClass;
import org.junit.Rule;
import org.junit.Test;
import org.junit.rules.TemporaryFolder;
import org.junit.rules.TestName;

import javax.annotation.Nonnull;
import javax.annotation.Nullable;

import java.io.File;
import java.io.IOException;
import java.net.URI;
import java.net.URISyntaxException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.Duration;
import java.time.temporal.ChronoUnit;
import java.util.Collection;
import java.util.Collections;
import java.util.Optional;
import java.util.UUID;
import java.util.concurrent.ArrayBlockingQueue;
import java.util.concurrent.CompletableFuture;
import java.util.concurrent.CountDownLatch;
import java.util.concurrent.ExecutionException;
import java.util.concurrent.TimeUnit;
import java.util.concurrent.TimeoutException;

import static org.hamcrest.Matchers.either;
import static org.hamcrest.Matchers.empty;
import static org.hamcrest.Matchers.equalTo;
import static org.hamcrest.Matchers.instanceOf;
import static org.hamcrest.Matchers.notNullValue;
import static org.hamcrest.core.Is.is;
import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertThat;
import static org.junit.Assert.assertTrue;
import static org.junit.Assert.fail;

/**
 * Test for the {@link Dispatcher} component.
 */
public class DispatcherTest extends TestLogger {

	private static RpcService rpcService;

	private static final Time TIMEOUT = Time.seconds(10L);

	private static final JobID TEST_JOB_ID = new JobID();

	@Rule
	public TemporaryFolder temporaryFolder = new TemporaryFolder();

	@Rule
	public final TestingFatalErrorHandlerResource testingFatalErrorHandlerResource = new TestingFatalErrorHandlerResource();

	@Rule
	public TestName name = new TestName();

	private JobGraph jobGraph;

	private TestingLeaderElectionService jobMasterLeaderElectionService;

	private CountDownLatch createdJobManagerRunnerLatch;

	private Configuration configuration;

	private BlobServer blobServer;

	/** Instance under test. */
	private TestingDispatcher dispatcher;

	private TestingHighAvailabilityServices haServices;

	private HeartbeatServices heartbeatServices;

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

	@Before
	public void setUp() throws Exception {
		final JobVertex testVertex = new JobVertex("testVertex");
		testVertex.setInvokableClass(NoOpInvokable.class);
		jobGraph = new JobGraph(TEST_JOB_ID, "testJob", testVertex);

		heartbeatServices = new HeartbeatServices(1000L, 10000L);

		jobMasterLeaderElectionService = new TestingLeaderElectionService();

		haServices = new TestingHighAvailabilityServices();
		haServices.setJobMasterLeaderElectionService(TEST_JOB_ID, jobMasterLeaderElectionService);
		haServices.setCheckpointRecoveryFactory(new StandaloneCheckpointRecoveryFactory());
		haServices.setResourceManagerLeaderRetriever(new SettableLeaderRetrievalService());

		configuration = new Configuration();

		configuration.setString(
			BlobServerOptions.STORAGE_DIRECTORY,
			temporaryFolder.newFolder().getAbsolutePath());

		createdJobManagerRunnerLatch = new CountDownLatch(2);
		blobServer = new BlobServer(configuration, new VoidBlobStore());
	}

	@Nonnull
	private TestingDispatcher createAndStartDispatcher(
			HeartbeatServices heartbeatServices,
			TestingHighAvailabilityServices haServices,
			JobManagerRunnerFactory jobManagerRunnerFactory) throws Exception {
		final TestingDispatcher dispatcher = new TestingDispatcherBuilder()
			.setHaServices(haServices)
			.setHeartbeatServices(heartbeatServices)
			.setJobManagerRunnerFactory(jobManagerRunnerFactory)
			.build();
		dispatcher.start();

		return dispatcher;
	}

	private class TestingDispatcherBuilder {

		private DispatcherBootstrap dispatcherBootstrap = new DefaultDispatcherBootstrap(Collections.emptyList());

		private HeartbeatServices heartbeatServices = DispatcherTest.this.heartbeatServices;

		private HighAvailabilityServices haServices = DispatcherTest.this.haServices;

		private JobManagerRunnerFactory jobManagerRunnerFactory = DefaultJobManagerRunnerFactory.INSTANCE;

		private JobGraphWriter jobGraphWriter = NoOpJobGraphWriter.INSTANCE;

		TestingDispatcherBuilder setHeartbeatServices(HeartbeatServices heartbeatServices) {
			this.heartbeatServices = heartbeatServices;
			return this;
		}

		TestingDispatcherBuilder setHaServices(HighAvailabilityServices haServices) {
			this.haServices = haServices;
			return this;
		}

		TestingDispatcherBuilder setDispatcherBootstrap(DispatcherBootstrap dispatcherBootstrap) {
			this.dispatcherBootstrap = dispatcherBootstrap;
			return this;
		}

		TestingDispatcherBuilder setJobManagerRunnerFactory(JobManagerRunnerFactory jobManagerRunnerFactory) {
			this.jobManagerRunnerFactory = jobManagerRunnerFactory;
			return this;
		}

		TestingDispatcherBuilder setJobGraphWriter(JobGraphWriter jobGraphWriter) {
			this.jobGraphWriter = jobGraphWriter;
			return this;
		}

		TestingDispatcher build() throws Exception {
			TestingResourceManagerGateway resourceManagerGateway = new TestingResourceManagerGateway();

			final MemoryArchivedExecutionGraphStore archivedExecutionGraphStore = new MemoryArchivedExecutionGraphStore();

			return new TestingDispatcher(
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
		}
	}

	@After
	public void tearDown() throws Exception {
		if (dispatcher != null) {
			RpcUtils.terminateRpcEndpoint(dispatcher, TIMEOUT);
		}

		if (haServices != null) {
			haServices.closeAndCleanupAllData();
		}

		if (blobServer != null) {
			blobServer.close();
		}
	}

	/**
	 * Tests that we can submit a job to the Dispatcher which then spawns a
	 * new JobManagerRunner.
	 */
	@Test
	public void testJobSubmission() throws Exception {
		dispatcher = createAndStartDispatcher(heartbeatServices, haServices, new ExpectedJobIdJobManagerRunnerFactory(TEST_JOB_ID, createdJobManagerRunnerLatch));
		// grant leadership to job master so that we can call dispatcherGateway.requestJobStatus().
		jobMasterLeaderElectionService.isLeader(UUID.randomUUID());
		DispatcherGateway dispatcherGateway = dispatcher.getSelfGateway(DispatcherGateway.class);

		dispatcherGateway.submitJob(jobGraph, TIMEOUT).get();

		CommonTestUtils.waitUntilCondition(() -> dispatcherGateway.requestJobStatus(jobGraph.getJobID(), TIMEOUT).get() == JobStatus.RUNNING,
			Deadline.fromNow(Duration.of(10, ChronoUnit.SECONDS)), 20L);

		assertTrue(
			"jobManagerRunner was not started",
			jobMasterLeaderElectionService.getStartFuture().isDone());
	}

	/**
	 * Tests that we can submit a job to the Dispatcher which then spawns a
	 * new JobManagerRunner.
	 */
	@Test
	public void testJobSubmissionWithPartialResourceConfigured() throws Exception {
		dispatcher = createAndStartDispatcher(heartbeatServices, haServices, new ExpectedJobIdJobManagerRunnerFactory(TEST_JOB_ID, createdJobManagerRunnerLatch));

		DispatcherGateway dispatcherGateway = dispatcher.getSelfGateway(DispatcherGateway.class);

		ResourceSpec resourceSpec = ResourceSpec.newBuilder(2.0, 0).build();

		final JobVertex firstVertex = new JobVertex("firstVertex");
		firstVertex.setInvokableClass(NoOpInvokable.class);
		firstVertex.setResources(resourceSpec, resourceSpec);

		final JobVertex secondVertex = new JobVertex("secondVertex");
		secondVertex.setInvokableClass(NoOpInvokable.class);

		JobGraph jobGraphWithTwoVertices = new JobGraph(TEST_JOB_ID, "twoVerticesJob", firstVertex, secondVertex);

		CompletableFuture<Acknowledge> acknowledgeFuture = dispatcherGateway.submitJob(jobGraphWithTwoVertices, TIMEOUT);

		try {
			acknowledgeFuture.get();
			fail("job submission should have failed");
		}
		catch (ExecutionException e) {
			assertTrue(ExceptionUtils.findThrowable(e, JobSubmissionException.class).isPresent());
		}
	}

	@Test(timeout = 5_000L)
	public void testNonBlockingJobSubmission() throws Exception {
		dispatcher = createAndStartDispatcher(heartbeatServices, haServices, new ExpectedJobIdJobManagerRunnerFactory(TEST_JOB_ID, createdJobManagerRunnerLatch));
		jobMasterLeaderElectionService.isLeader(UUID.randomUUID());
		DispatcherGateway dispatcherGateway = dispatcher.getSelfGateway(DispatcherGateway.class);

		// create a job graph of a job that blocks forever
		final BlockingJobVertex blockingJobVertex = new BlockingJobVertex("testVertex");
		blockingJobVertex.setInvokableClass(NoOpInvokable.class);
		JobGraph blockingJobGraph = new JobGraph(TEST_JOB_ID, "blockingTestJob", blockingJobVertex);

		dispatcherGateway.submitJob(blockingJobGraph, TIMEOUT).get();

		// ensure INITIALIZING status from status
		CompletableFuture<JobStatus> jobStatusFuture = dispatcherGateway.requestJobStatus(blockingJobGraph.getJobID(), TIMEOUT);
		Assert.assertEquals(JobStatus.INITIALIZING, jobStatusFuture.get());

		// ensure correct JobDetails
		MultipleJobsDetails multiDetails = dispatcherGateway.requestMultipleJobDetails(TIMEOUT).get();
		Assert.assertEquals(1, multiDetails.getJobs().size());
		Assert.assertEquals(blockingJobGraph.getJobID(), multiDetails.getJobs().iterator().next().getJobId());

		// submission has succeeded, let the initialization finish.
		blockingJobVertex.unblock();

		// wait till job is running
		CommonTestUtils.waitUntilJobManagerIsInitialized(() -> dispatcherGateway.requestJobStatus(blockingJobGraph.getJobID(), TIMEOUT).get());

		dispatcherGateway.cancelJob(blockingJobGraph.getJobID(), TIMEOUT).get();
	}

	@Test(timeout = 5_000L)
	public void testInvalidCallDuringInitialization() throws Exception {
		dispatcher = createAndStartDispatcher(heartbeatServices, haServices, new ExpectedJobIdJobManagerRunnerFactory(TEST_JOB_ID, createdJobManagerRunnerLatch));
		jobMasterLeaderElectionService.isLeader(UUID.randomUUID());
		DispatcherGateway dispatcherGateway = dispatcher.getSelfGateway(DispatcherGateway.class);

		// create a job graph of a job that blocks forever
		final BlockingJobVertex blockingJobVertex = new BlockingJobVertex("testVertex");
		blockingJobVertex.setInvokableClass(NoOpInvokable.class);
		JobGraph blockingJobGraph = new JobGraph(TEST_JOB_ID, "blockingTestJob", blockingJobVertex);

		dispatcherGateway.submitJob(blockingJobGraph, TIMEOUT).get();

		// ensure INITIALIZING status
		CompletableFuture<JobStatus> jobStatusFuture = dispatcherGateway.requestJobStatus(blockingJobGraph.getJobID(), TIMEOUT);
		Assert.assertEquals(JobStatus.INITIALIZING, jobStatusFuture.get());

		// this call is supposed to fail
		boolean exceptionSeen = false;
		try {
			dispatcherGateway.triggerSavepoint(blockingJobGraph.getJobID(), "file:///tmp/savepoint", false, TIMEOUT).get();
		} catch (ExecutionException t) {
			Assert.assertTrue(t.getCause() instanceof UnavailableDispatcherOperationException);
			exceptionSeen = true;
		}
		Assert.assertTrue(exceptionSeen);

		// submission has succeeded, let the initialization finish.
		blockingJobVertex.unblock();
	}

	@Test(timeout = 5_000L)
	public void testCancellationDuringInitialization() throws Exception {
		dispatcher = createAndStartDispatcher(heartbeatServices, haServices, new ExpectedJobIdJobManagerRunnerFactory(TEST_JOB_ID, createdJobManagerRunnerLatch));
		jobMasterLeaderElectionService.isLeader(UUID.randomUUID());
		DispatcherGateway dispatcherGateway = dispatcher.getSelfGateway(DispatcherGateway.class);

		// create a job graph of a job that blocks forever
		final BlockingJobVertex blockingJobVertex = new BlockingJobVertex("testVertex");
		blockingJobVertex.setInvokableClass(NoOpInvokable.class);
		JobGraph blockingJobGraph = new JobGraph(TEST_JOB_ID, "blockingTestJob", blockingJobVertex);

		dispatcherGateway.submitJob(blockingJobGraph, TIMEOUT).get();

		Assert.assertThat(dispatcherGateway.requestJobStatus(blockingJobGraph.getJobID(), TIMEOUT).get(), is(JobStatus.INITIALIZING));

		// submission has succeeded, now cancel the job
		CompletableFuture<Acknowledge> cancellationFuture = dispatcherGateway.cancelJob(blockingJobGraph.getJobID(), TIMEOUT);
		Assert.assertThat(dispatcherGateway.requestJobStatus(blockingJobGraph.getJobID(), TIMEOUT).get(), is(JobStatus.CANCELLING));
		Assert.assertThat(cancellationFuture.isDone(), is(false));
		// unblock
		blockingJobVertex.unblock();
		// wait until cancelled
		cancellationFuture.get();
		Assert.assertThat(dispatcherGateway.requestJobStatus(blockingJobGraph.getJobID(), TIMEOUT).get(), is(JobStatus.CANCELED));
	}

	@Test
	public void testErrorDuringInitialization() throws Exception {
		dispatcher = createAndStartDispatcher(heartbeatServices, haServices, new ExpectedJobIdJobManagerRunnerFactory(TEST_JOB_ID, createdJobManagerRunnerLatch));
		jobMasterLeaderElectionService.isLeader(UUID.randomUUID());
		DispatcherGateway dispatcherGateway = dispatcher.getSelfGateway(DispatcherGateway.class);

		// create a job graph that fails during initialization
		final FailingInitializationJobVertex failingInitializationJobVertex = new FailingInitializationJobVertex(
			"testVertex");
		failingInitializationJobVertex.setInvokableClass(NoOpInvokable.class);
		JobGraph blockingJobGraph = new JobGraph(TEST_JOB_ID, "failingTestJob", failingInitializationJobVertex);

		dispatcherGateway.submitJob(blockingJobGraph, TIMEOUT).get();

		// wait till job has failed
		JobStatus status;
		do {
			CompletableFuture<JobStatus> statusFuture = dispatcherGateway.requestJobStatus(blockingJobGraph.getJobID(), TIMEOUT);
			status = statusFuture.get();
			Thread.sleep(50);
			Assert.assertThat(status, either(is(JobStatus.INITIALIZING)).or(is(JobStatus.FAILED)));
		} while (status != JobStatus.FAILED);

		// get failure cause
		ArchivedExecutionGraph execGraph = dispatcherGateway.requestJob(jobGraph.getJobID(), TIMEOUT).get();
		Assert.assertNotNull(execGraph.getFailureInfo());
		Assert.assertTrue(execGraph.getFailureInfo().getExceptionAsString().contains("Artificial test failure"));

		closeDispatcherAfterInitializationError();
	}

	/**
	 * Test that {@link JobResult} is cached when the job finishes.
	 */
	@Test
	public void testCacheJobExecutionResult() throws Exception {
		dispatcher = createAndStartDispatcher(heartbeatServices, haServices, new ExpectedJobIdJobManagerRunnerFactory(TEST_JOB_ID, createdJobManagerRunnerLatch));

		final DispatcherGateway dispatcherGateway = dispatcher.getSelfGateway(DispatcherGateway.class);

		final JobID failedJobId = new JobID();

		final JobStatus expectedState = JobStatus.FAILED;
		final ArchivedExecutionGraph failedExecutionGraph = new ArchivedExecutionGraphBuilder()
			.setJobID(failedJobId)
			.setState(expectedState)
			.setFailureCause(new ErrorInfo(new RuntimeException("expected"), 1L))
			.build();

		dispatcher.completeJobExecution(failedExecutionGraph);

		assertThat(
			dispatcherGateway.requestJobStatus(failedJobId, TIMEOUT).get(),
			equalTo(expectedState));
		assertThat(
			dispatcherGateway.requestJob(failedJobId, TIMEOUT).get(),
			equalTo(failedExecutionGraph));
	}

	@Test
	public void testThrowExceptionIfJobExecutionResultNotFound() throws Exception {
		dispatcher = createAndStartDispatcher(heartbeatServices, haServices, new ExpectedJobIdJobManagerRunnerFactory(TEST_JOB_ID, createdJobManagerRunnerLatch));

		final DispatcherGateway dispatcherGateway = dispatcher.getSelfGateway(DispatcherGateway.class);
		try {
			dispatcherGateway.requestJob(new JobID(), TIMEOUT).get();
		} catch (ExecutionException e) {
			final Throwable throwable = ExceptionUtils.stripExecutionException(e);
			assertThat(throwable, instanceOf(FlinkJobNotFoundException.class));
		}
	}

	/**
	 * Tests that we can dispose a savepoint.
	 */
	@Test
	public void testSavepointDisposal() throws Exception {
		final URI externalPointer = createTestingSavepoint();
		final Path savepointPath = Paths.get(externalPointer);

		dispatcher = createAndStartDispatcher(heartbeatServices, haServices, new ExpectedJobIdJobManagerRunnerFactory(TEST_JOB_ID, createdJobManagerRunnerLatch));

		final DispatcherGateway dispatcherGateway = dispatcher.getSelfGateway(DispatcherGateway.class);

		assertThat(Files.exists(savepointPath), is(true));

		dispatcherGateway.disposeSavepoint(externalPointer.toString(), TIMEOUT).get();

		assertThat(Files.exists(savepointPath), is(false));
	}

	@Nonnull
	private URI createTestingSavepoint() throws IOException, URISyntaxException {
		final StateBackend stateBackend = Checkpoints.loadStateBackend(configuration, Thread.currentThread().getContextClassLoader(), log);
		final CheckpointStorageCoordinatorView checkpointStorage = stateBackend.createCheckpointStorage(jobGraph.getJobID());
		final File savepointFile = temporaryFolder.newFolder();
		final long checkpointId = 1L;

		final CheckpointStorageLocation checkpointStorageLocation = checkpointStorage.initializeLocationForSavepoint(checkpointId, savepointFile.getAbsolutePath());

		final CheckpointMetadataOutputStream metadataOutputStream = checkpointStorageLocation.createMetadataOutputStream();
		Checkpoints.storeCheckpointMetadata(new CheckpointMetadata(checkpointId, Collections.emptyList(), Collections.emptyList()), metadataOutputStream);

		final CompletedCheckpointStorageLocation completedCheckpointStorageLocation = metadataOutputStream.closeAndFinalizeCheckpoint();

		return new URI(completedCheckpointStorageLocation.getExternalPointer());

	}

	/**
	 * Tests that we wait until the JobMaster has gained leader ship before sending requests
	 * to it. See FLINK-8887.
	 */
	@Test
	public void testWaitingForJobMasterLeadership() throws Exception {
		dispatcher = createAndStartDispatcher(heartbeatServices, haServices, new ExpectedJobIdJobManagerRunnerFactory(TEST_JOB_ID, createdJobManagerRunnerLatch));

		final DispatcherGateway dispatcherGateway = dispatcher.getSelfGateway(DispatcherGateway.class);

		dispatcherGateway.submitJob(jobGraph, TIMEOUT).get();

		CompletableFuture<JobStatus> jobStatusFuture = dispatcherGateway.requestJobStatus(jobGraph.getJobID(), TIMEOUT);

		assertThat(jobStatusFuture.isDone(), is(false));

		// Make sure that the jobstatus request is blocking after it has left the INITIALIZING status
		boolean timeoutSeen = false;
		while (!timeoutSeen) {
			try {
				jobStatusFuture = dispatcherGateway.requestJobStatus(jobGraph.getJobID(), TIMEOUT);
				JobStatus jobStatus = jobStatusFuture.get(10, TimeUnit.MILLISECONDS);
				if (jobStatus != JobStatus.INITIALIZING) {
					fail("Should not complete.");
				} else {
					Thread.sleep(10); // give more time to initialize
				}
			} catch (TimeoutException ignored) {
				timeoutSeen = true;
			}
		}
		// Job is initialized. Make the master leader
		jobMasterLeaderElectionService.isLeader(UUID.randomUUID()).get();

		// ensure that the future is now completing
		assertThat(jobStatusFuture.get(), notNullValue());
	}

	/**
	 * Tests that the {@link Dispatcher} fails fatally if the recovered jobs cannot be started.
	 * See FLINK-9097.
	 */
	@Test
	public void testFatalErrorIfRecoveredJobsCannotBeStarted() throws Exception {
		final FlinkException testException = new FlinkException("Test exception");

		final JobGraph failingJobGraph = createFailingJobGraph(testException);

		dispatcher = new TestingDispatcherBuilder()
			.setDispatcherBootstrap(new DefaultDispatcherBootstrap(Collections.singleton(failingJobGraph)))
			.build();

		dispatcher.start();

		final TestingFatalErrorHandler fatalErrorHandler = testingFatalErrorHandlerResource.getFatalErrorHandler();

		final Throwable error = fatalErrorHandler.getErrorFuture().get(TIMEOUT.toMilliseconds(), TimeUnit.MILLISECONDS);

		assertThat(ExceptionUtils.findThrowableWithMessage(error, testException.getMessage()).isPresent(), is(true));

		fatalErrorHandler.clearError();
		closeDispatcherAfterInitializationError();
	}

	/**
	 * Tests that a blocking {@link JobManagerRunner} creation, e.g. due to blocking FileSystem access,
	 * does not block the {@link Dispatcher}.
	 *
	 * <p>See FLINK-10314
	 */
	@Test
	public void testBlockingJobManagerRunner() throws Exception {
		final OneShotLatch jobManagerRunnerCreationLatch = new OneShotLatch();
		dispatcher = createAndStartDispatcher(
			heartbeatServices,
			haServices,
			new BlockingJobManagerRunnerFactory(jobManagerRunnerCreationLatch::await, getMockedRunningJobMasterGateway()));
		jobMasterLeaderElectionService.isLeader(UUID.randomUUID());
		final DispatcherGateway dispatcherGateway = dispatcher.getSelfGateway(DispatcherGateway.class);

		dispatcherGateway.submitJob(jobGraph, TIMEOUT).get();

		assertThat(dispatcherGateway.requestJobStatus(jobGraph.getJobID(), TIMEOUT).get(), is(JobStatus.INITIALIZING));

		final CompletableFuture<Collection<String>> metricQueryServiceAddressesFuture = dispatcherGateway.requestMetricQueryServiceAddresses(Time.seconds(5L));

		assertThat(metricQueryServiceAddressesFuture.get(), is(empty()));

		assertThat(dispatcherGateway.requestJobStatus(jobGraph.getJobID(), TIMEOUT).get(), is(JobStatus.INITIALIZING));

		jobManagerRunnerCreationLatch.trigger();

		CommonTestUtils.waitUntilCondition(() -> dispatcherGateway.requestJobStatus(jobGraph.getJobID(), TIMEOUT).get() == JobStatus.RUNNING,
			Deadline.fromNow(Duration.of(10, ChronoUnit.SECONDS)), 5L);
		assertThat(dispatcherGateway.requestJobStatus(jobGraph.getJobID(), TIMEOUT).get(), is(JobStatus.RUNNING));
	}

	/**
	 * Tests that a failing {@link JobManagerRunner} will be properly cleaned up.
	 */
	@Test
	public void testFailingJobManagerRunnerCleanup() throws Exception {
		final FlinkException testException = new FlinkException("Test exception.");
		final ArrayBlockingQueue<Optional<Exception>> queue = new ArrayBlockingQueue<>(2);

		dispatcher = createAndStartDispatcher(
			heartbeatServices,
			haServices,
			new BlockingJobManagerRunnerFactory(() -> {
				final Optional<Exception> take = queue.take();
				final Exception exception = take.orElse(null);

				if (exception != null) {
					throw exception;
				}
			}, getMockedRunningJobMasterGateway()));

		final DispatcherGateway dispatcherGateway = dispatcher.getSelfGateway(DispatcherGateway.class);

		dispatcherGateway.submitJob(jobGraph, TIMEOUT).get();

		assertThat(dispatcherGateway.requestJobStatus(jobGraph.getJobID(), TIMEOUT).get(), is(JobStatus.INITIALIZING));

		queue.offer(Optional.of(testException));

		// wait till job is failed
		JobStatus status;
		do {
			status = dispatcherGateway.requestJobStatus(
				jobGraph.getJobID(),
				TIMEOUT).get();
			Assert.assertThat(
				status,
				either(Matchers.is(JobStatus.INITIALIZING)).or(Matchers.is(JobStatus.FAILED)));
			Thread.sleep(20);
		} while (status != JobStatus.FAILED);

		ArchivedExecutionGraph execGraph = dispatcherGateway.requestJob(jobGraph.getJobID(), TIMEOUT).get();
		Assert.assertNotNull(execGraph.getFailureInfo());
		assertThat(ExceptionUtils.findSerializedThrowable(execGraph.getFailureInfo().getException(), FlinkException.class, this.getClass().getClassLoader()).isPresent(), is(true));

		// submit job again
		dispatcherGateway.submitJob(jobGraph, TIMEOUT).get();

		// don't fail this time
		queue.offer(Optional.empty());

		// Ensure job is running
		CommonTestUtils.waitUntilCondition(() -> dispatcherGateway.requestJobStatus(jobGraph.getJobID(), TIMEOUT).get() == JobStatus.RUNNING,
			Deadline.fromNow(Duration.of(10, ChronoUnit.SECONDS)), 5L);
	}

	@Test
	public void testPersistedJobGraphWhenDispatcherIsShutDown() throws Exception {
		final TestingJobGraphStore submittedJobGraphStore = TestingJobGraphStore.newBuilder().build();
		submittedJobGraphStore.start(null);
		haServices.setJobGraphStore(submittedJobGraphStore);

		dispatcher = new TestingDispatcherBuilder()
			.setJobGraphWriter(submittedJobGraphStore)
			.build();

		dispatcher.start();
		jobMasterLeaderElectionService.isLeader(UUID.randomUUID());

		final DispatcherGateway dispatcherGateway = dispatcher.getSelfGateway(DispatcherGateway.class);
		dispatcherGateway.submitJob(jobGraph, TIMEOUT).get();

		CommonTestUtils.waitUntilJobManagerIsInitialized(() -> dispatcherGateway.requestJobStatus(jobGraph.getJobID(), TIMEOUT).get());

		assertThat(dispatcher.getNumberJobs(TIMEOUT).get(), Matchers.is(1));

		dispatcher.close();

		assertThat(submittedJobGraphStore.contains(jobGraph.getJobID()), Matchers.is(true));
	}

	/**
	 * Tests that a submitted job is suspended if the Dispatcher is terminated.
	 */
	@Test
	public void testJobSuspensionWhenDispatcherIsTerminated() throws Exception {
		dispatcher = createAndStartDispatcher(heartbeatServices, haServices, new ExpectedJobIdJobManagerRunnerFactory(TEST_JOB_ID, createdJobManagerRunnerLatch));
		jobMasterLeaderElectionService.isLeader(UUID.randomUUID());

		DispatcherGateway dispatcherGateway = dispatcher.getSelfGateway(DispatcherGateway.class);

		dispatcherGateway.submitJob(jobGraph, TIMEOUT).get();
		CommonTestUtils.waitUntilJobManagerIsInitialized(() -> dispatcherGateway.requestJobStatus(jobGraph.getJobID(), TIMEOUT).get());

		final CompletableFuture<JobResult> jobResultFuture = dispatcherGateway.requestJobResult(jobGraph.getJobID(), TIMEOUT);

		assertThat(jobResultFuture.isDone(), is(false));

		dispatcher.closeAsync();

		try {
			jobResultFuture.get();
			fail("Expected the job result to throw an exception.");
		} catch (ExecutionException ee) {
			assertThat(ExceptionUtils.findThrowable(ee, JobNotFinishedException.class).isPresent(), is(true));
		}
	}

	@Test
	public void testShutDownClusterShouldCompleteShutDownFuture() throws Exception {
		dispatcher = createAndStartDispatcher(heartbeatServices, haServices, DefaultJobManagerRunnerFactory.INSTANCE);
		final DispatcherGateway dispatcherGateway = dispatcher.getSelfGateway(DispatcherGateway.class);

		dispatcherGateway.shutDownCluster().get();

		dispatcher.getShutDownFuture().get();
	}

	@Test
	public void testOnRemovedJobGraphDoesNotCleanUpHAFiles() throws Exception {
		final CompletableFuture<JobID> removeJobGraphFuture = new CompletableFuture<>();
		final TestingJobGraphStore testingJobGraphStore = TestingJobGraphStore.newBuilder()
			.setRemoveJobGraphConsumer(removeJobGraphFuture::complete)
			.build();

		dispatcher = new TestingDispatcherBuilder()
			.setDispatcherBootstrap(new DefaultDispatcherBootstrap(Collections.singleton(jobGraph)))
			.setJobGraphWriter(testingJobGraphStore)
			.build();
		dispatcher.start();

		// we need to elect a jobmaster leader to be able to cancel the job on the JobMaster.
		jobMasterLeaderElectionService.isLeader(UUID.randomUUID()).get();

		final CompletableFuture<Void> processFuture = dispatcher.onRemovedJobGraph(jobGraph.getJobID());

		processFuture.join();

		try {
			removeJobGraphFuture.get(10L, TimeUnit.MILLISECONDS);
			fail("onRemovedJobGraph should not remove the job from the JobGraphStore.");
		} catch (TimeoutException expected) {}
	}

	private static final class BlockingJobManagerRunnerFactory extends TestingJobManagerRunnerFactory {

		@Nonnull
		private final ThrowingRunnable<Exception> jobManagerRunnerCreationLatch;
		@Nullable
		private final JobMasterGateway jobMasterGateway;

		BlockingJobManagerRunnerFactory(@Nonnull ThrowingRunnable<Exception> jobManagerRunnerCreationLatch, @Nullable JobMasterGateway jobMasterGateway) {
			this.jobManagerRunnerCreationLatch = jobManagerRunnerCreationLatch;
			this.jobMasterGateway = jobMasterGateway;
		}

		@Override
		public TestingJobManagerRunner createJobManagerRunner(JobGraph jobGraph, Configuration configuration, RpcService rpcService, HighAvailabilityServices highAvailabilityServices, HeartbeatServices heartbeatServices, JobManagerSharedServices jobManagerSharedServices, JobManagerJobMetricGroupFactory jobManagerJobMetricGroupFactory, FatalErrorHandler fatalErrorHandler) throws Exception {
			jobManagerRunnerCreationLatch.run();

			TestingJobManagerRunner runner = super.createJobManagerRunner(jobGraph, configuration, rpcService, highAvailabilityServices, heartbeatServices, jobManagerSharedServices, jobManagerJobMetricGroupFactory, fatalErrorHandler);
			if (jobMasterGateway != null) {
				runner.getJobMasterGateway().complete(jobMasterGateway);
			}
			return runner;
		}
	}

	private JobGraph createFailingJobGraph(Exception failureCause) {
		final FailingJobVertex jobVertex = new FailingJobVertex("Failing JobVertex", failureCause);
		jobVertex.setInvokableClass(NoOpInvokable.class);
		return new JobGraph(jobGraph.getJobID(), "Failing JobGraph", jobVertex);
	}

	private static class FailingJobVertex extends JobVertex {

		private static final long serialVersionUID = 3218428829168840760L;

		private final Exception failure;

		private FailingJobVertex(String name, Exception failure) {
			super(name);
			this.failure = failure;
		}

		@Override
		public void initializeOnMaster(ClassLoader loader) throws Exception {
			throw failure;
		}
	}

	private static final class ExpectedJobIdJobManagerRunnerFactory implements JobManagerRunnerFactory {

		private final JobID expectedJobId;

		private final CountDownLatch createdJobManagerRunnerLatch;

		private ExpectedJobIdJobManagerRunnerFactory(JobID expectedJobId, CountDownLatch createdJobManagerRunnerLatch) {
			this.expectedJobId = expectedJobId;
			this.createdJobManagerRunnerLatch = createdJobManagerRunnerLatch;
		}

		@Override
		public JobManagerRunner createJobManagerRunner(
				JobGraph jobGraph,
				Configuration configuration,
				RpcService rpcService,
				HighAvailabilityServices highAvailabilityServices,
				HeartbeatServices heartbeatServices,
				JobManagerSharedServices jobManagerSharedServices,
				JobManagerJobMetricGroupFactory jobManagerJobMetricGroupFactory,
				FatalErrorHandler fatalErrorHandler) throws Exception {
			assertEquals(expectedJobId, jobGraph.getJobID());

			createdJobManagerRunnerLatch.countDown();

			return DefaultJobManagerRunnerFactory.INSTANCE.createJobManagerRunner(
				jobGraph,
				configuration,
				rpcService,
				highAvailabilityServices,
				heartbeatServices,
				jobManagerSharedServices,
				jobManagerJobMetricGroupFactory,
				fatalErrorHandler);
		}
	}

	private static class BlockingJobVertex extends JobVertex {
		private final Object lock = new Object();
		private boolean blocking = true;
		public BlockingJobVertex(String name) {
			super(name);
		}

		@Override
		public void initializeOnMaster(ClassLoader loader) throws Exception {
			super.initializeOnMaster(loader);

			while (true) {
				synchronized (lock) {
					if (!blocking) {
						return;
					}
					lock.wait(10);
				}
			}
		}

		public void unblock() {
			synchronized (lock) {
				blocking = false;
				lock.notify();
			}
		}
	}

	private static class FailingInitializationJobVertex extends JobVertex {
		public FailingInitializationJobVertex(String name) {
			super(name);
		}

		@Override
		public void initializeOnMaster(ClassLoader loader) {
			throw new IllegalStateException("Artificial test failure");
		}
	}

	private TestingJobMasterGateway getMockedRunningJobMasterGateway() {
		return new TestingJobMasterGatewayBuilder()
			.setRequestJobSupplier(() -> CompletableFuture.completedFuture(ArchivedExecutionGraph.createFromInitializingJob(jobGraph.getJobID(),
				jobGraph.getName(),
				JobStatus.RUNNING,
				null,
				1337))
			).build();
	}

	/**
	 * The termination future of DispatcherJob forwards exceptions from the JobManager initialization.
	 * Tests that fail during initialization can use this method to validate the correct behavior of the dispatcher shutdown process.
	 */
	private void closeDispatcherAfterInitializationError() {
		org.apache.flink.core.testutils.CommonTestUtils.assertThrows("Could not instantiate JobManager", ExecutionException.class, () ->
			dispatcher.closeAsync().get());
		dispatcher = null;
	}
}
