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
import org.apache.flink.api.common.time.Time;
import org.apache.flink.core.testutils.CommonTestUtils;
import org.apache.flink.runtime.concurrent.FutureUtils;
import org.apache.flink.runtime.executiongraph.ArchivedExecutionGraph;
import org.apache.flink.runtime.jobgraph.JobGraph;
import org.apache.flink.runtime.jobgraph.JobVertex;
import org.apache.flink.runtime.jobmaster.JobManagerRunner;
import org.apache.flink.runtime.jobmaster.JobNotFinishedException;
import org.apache.flink.runtime.jobmaster.TestingJobManagerRunner;
import org.apache.flink.runtime.jobmaster.utils.TestingJobMasterGateway;
import org.apache.flink.runtime.jobmaster.utils.TestingJobMasterGatewayBuilder;
import org.apache.flink.runtime.messages.webmonitor.JobDetails;
import org.apache.flink.runtime.testtasks.NoOpInvokable;
import org.apache.flink.util.TestLogger;
import org.apache.flink.util.function.FunctionUtils;

import org.junit.Assert;
import org.junit.Test;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.util.concurrent.CompletableFuture;
import java.util.concurrent.ExecutionException;

import static org.hamcrest.core.Is.is;

/**
 * Test for the {@link DispatcherJob} class.
 */
public class DispatcherJobTest extends TestLogger {

	protected final Logger log = LoggerFactory.getLogger(getClass());

	private static final Time TIMEOUT = Time.seconds(10L);
	private static final JobID TEST_JOB_ID = new JobID();

	@Test
	public void testInitialJobStatusIsInitializing() throws
		ExecutionException,
		InterruptedException {
		TestContext testContext = createTestContext();
		DispatcherJob dispatcherJob = testContext.dispatcherJob;

		Assert.assertThat(dispatcherJob.isRunning(), is(false));
		Assert.assertThat(dispatcherJob.requestJobStatus(TIMEOUT).get(), is(JobStatus.INITIALIZING));
		Assert.assertThat(dispatcherJob.requestJobDetails(TIMEOUT).get().getStatus(), is(JobStatus.INITIALIZING));
		Assert.assertThat(dispatcherJob.getResultFuture().isDone(), is(false));
	}

	@Test
	public void testInitialSubmissionError() throws ExecutionException, InterruptedException {
		TestContext testContext = createTestContext();
		DispatcherJob dispatcherJob = testContext.dispatcherJob;

		// now fail
		RuntimeException exception = new RuntimeException("Artificial failure in runner initialization");
		testContext.completeJobManagerRunnerFuture(exception);

		Assert.assertThat(dispatcherJob.isRunning(), is(false));
		Assert.assertThat(dispatcherJob.requestJobStatus(TIMEOUT).get(), is(JobStatus.FAILED));
		Assert.assertThat(dispatcherJob.requestJobDetails(TIMEOUT).get().getStatus(), is(JobStatus.FAILED));
		Assert.assertThat(dispatcherJob.getResultFuture().isDone(), is(true));
		ArchivedExecutionGraph aeg = dispatcherJob.getResultFuture().get();
		Assert.assertThat(aeg.getFailureInfo().getException().deserializeError(ClassLoader.getSystemClassLoader()),	is(exception));

		Assert.assertTrue(dispatcherJob.closeAsync().isDone() && !dispatcherJob.closeAsync().isCompletedExceptionally());
	}

	@Test
	public void testCloseWhileInitializing() throws Exception {
		TestContext testContext = createTestContext();
		DispatcherJob dispatcherJob = testContext.getDispatcherJob();

		CompletableFuture<Void> closeFuture = dispatcherJob.closeAsync();
		Assert.assertThat(closeFuture.isDone(), is(false));

		// create a jobmanager runner with a mocked JobMaster gateway, that cancels right away.
		TestingJobManagerRunner jobManagerRunner =
			new TestingJobManagerRunner(testContext.getJobID(), false);

		// complete JobManager runner future to indicate to the DispatcherJob that the Runner has been initialized
		testContext.completeJobManagerRunnerFuture(jobManagerRunner);

		// this future should now complete (because we were able to cancel the job)
		closeFuture.get();

		CompletableFuture<ArchivedExecutionGraph> resultFuture = dispatcherJob.getResultFuture();
		CommonTestUtils.assertThrows("has not been finished", ExecutionException.class,
			resultFuture::get);
	}

	@Test
	public void testCloseWhileRunning() throws Exception {
		TestContext testContext = createTestContext();
		DispatcherJob dispatcherJob = testContext.dispatcherJob;

		// create a jobmanager runner with a mocked JobMaster gateway
		TestingJobManagerRunner jobManagerRunner =
			new TestingJobManagerRunner(testContext.getJobID(), true);
		TestingJobMasterGateway mockRunningJobMasterGateway = new TestingJobMasterGatewayBuilder()
			.setRequestJobDetailsSupplier(() -> {
				JobDetails jobDetails = new JobDetails(testContext.getJobID(), "", 0, 0, 0, JobStatus.RUNNING, 0,
					new int[]{0, 0, 0, 0, 0, 0, 0, 0, 0}, 0);
				return CompletableFuture.completedFuture(jobDetails);
			})
			.build();
		jobManagerRunner.getJobMasterGateway().complete(mockRunningJobMasterGateway);

		// complete JobManager runner future to indicate to the DispatcherJob that the Runner has been initialized
		testContext.completeJobManagerRunnerFuture(jobManagerRunner);

		Assert.assertThat(dispatcherJob.requestJobStatus(TIMEOUT).get(), is(JobStatus.RUNNING));

		CompletableFuture<Void> closeFuture = dispatcherJob.closeAsync();

		Assert.assertThat(closeFuture.isDone(), is(false));

		// close JobManager runner
		jobManagerRunner.getTerminationFuture().complete(null);

		closeFuture.get();

		// result future should complete exceptionally.
		CompletableFuture<ArchivedExecutionGraph> resultFuture = dispatcherJob.getResultFuture();
		CommonTestUtils.assertThrows("has not been finished", ExecutionException.class,
			resultFuture::get);
	}

	@Test
	public void testRequestJobWhileInitializing() throws Exception {
		TestContext testContext = createTestContext();
		DispatcherJob dispatcherJob = testContext.dispatcherJob;

		Assert.assertThat(dispatcherJob.requestJobStatus(TIMEOUT).get(), is(JobStatus.INITIALIZING));

		ArchivedExecutionGraph job = dispatcherJob.requestJob(TIMEOUT).get();
		Assert.assertThat(job.getState(), is(JobStatus.INITIALIZING));
		Assert.assertThat(job.getJobID(), is(testContext.getJobID()));
	}

	private TestContext createTestContext() {
		final JobVertex testVertex = new JobVertex("testVertex");
		testVertex.setInvokableClass(NoOpInvokable.class);

		JobGraph jobGraph = new JobGraph(TEST_JOB_ID, "testJob", testVertex);
		CompletableFuture<JobManagerRunner> jobManagerRunnerCompletableFuture = new CompletableFuture<>();
		DispatcherJob dispatcherJob = DispatcherJob.createForSubmission(jobManagerRunnerCompletableFuture,
			jobGraph.getJobID(), jobGraph.getName(), 1337);

		return new TestContext(
			jobManagerRunnerCompletableFuture,
			dispatcherJob,
			jobGraph);
	}

	private static class TestContext {
		private final CompletableFuture<JobManagerRunner> jobManagerRunnerCompletableFuture;
		private final DispatcherJob dispatcherJob;
		private final JobGraph jobGraph;

		public TestContext(
			CompletableFuture<JobManagerRunner> jobManagerRunnerCompletableFuture,
			DispatcherJob dispatcherJob,
			JobGraph jobGraph) {
			this.jobManagerRunnerCompletableFuture = jobManagerRunnerCompletableFuture;
			this.dispatcherJob = dispatcherJob;
			this.jobGraph = jobGraph;
		}

		public JobID getJobID() {
			return jobGraph.getJobID();
		}

		public void completeJobManagerRunnerFuture(JobManagerRunner jobManagerRunner) {
			jobManagerRunnerCompletableFuture.complete(jobManagerRunner);
		}

		public void completeJobManagerRunnerFuture(Throwable ex) {
			jobManagerRunnerCompletableFuture.completeExceptionally(ex);
		}

		public DispatcherJob getDispatcherJob() {
			return dispatcherJob;
		}
	}
}
