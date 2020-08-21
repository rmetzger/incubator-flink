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
import org.apache.flink.client.program.ClusterClient;
import org.apache.flink.client.program.ContextEnvironment;
import org.apache.flink.client.program.PackagedProgram;
import org.apache.flink.client.program.ProgramInvocationException;
import org.apache.flink.client.program.StreamContextEnvironment;
import org.apache.flink.client.program.rest.retry.ExponentialWaitStrategy;
import org.apache.flink.client.program.rest.retry.WaitStrategy;
import org.apache.flink.configuration.Configuration;
import org.apache.flink.configuration.CoreOptions;
import org.apache.flink.configuration.DeploymentOptions;
import org.apache.flink.core.execution.PipelineExecutorServiceLoader;
import org.apache.flink.runtime.execution.librarycache.FlinkUserCodeClassLoaders;
import org.apache.flink.runtime.jobmaster.JobResult;
import org.apache.flink.util.ExceptionUtils;
import org.apache.flink.util.SerializedThrowable;
import org.apache.flink.util.function.SupplierWithException;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.net.URL;
import java.net.URLClassLoader;
import java.util.List;
import java.util.Optional;
import java.util.concurrent.CompletionException;

import static org.apache.flink.util.FlinkUserCodeClassLoader.NOOP_EXCEPTION_HANDLER;
import static org.apache.flink.util.Preconditions.checkNotNull;

/**
 * Utility functions for Flink client.
 */
public enum ClientUtils {
	;

	private static final Logger LOG = LoggerFactory.getLogger(ClientUtils.class);

	public static URLClassLoader buildUserCodeClassLoader(
			List<URL> jars,
			List<URL> classpaths,
			ClassLoader parent,
			Configuration configuration) {
		URL[] urls = new URL[jars.size() + classpaths.size()];
		for (int i = 0; i < jars.size(); i++) {
			urls[i] = jars.get(i);
		}
		for (int i = 0; i < classpaths.size(); i++) {
			urls[i + jars.size()] = classpaths.get(i);
		}
		final String[] alwaysParentFirstLoaderPatterns = CoreOptions.getParentFirstLoaderPatterns(configuration);
		final String classLoaderResolveOrder =
			configuration.getString(CoreOptions.CLASSLOADER_RESOLVE_ORDER);
		FlinkUserCodeClassLoaders.ResolveOrder resolveOrder =
			FlinkUserCodeClassLoaders.ResolveOrder.fromString(classLoaderResolveOrder);
		final boolean checkClassloaderLeak = configuration.getBoolean(CoreOptions.CHECK_LEAKED_CLASSLOADER);
		return FlinkUserCodeClassLoaders.create(
			resolveOrder,
			urls,
			parent,
			alwaysParentFirstLoaderPatterns,
			NOOP_EXCEPTION_HANDLER,
			checkClassloaderLeak);
	}

	public static void executeProgram(
			PipelineExecutorServiceLoader executorServiceLoader,
			Configuration configuration,
			PackagedProgram program,
			boolean enforceSingleJobExecution,
			boolean suppressSysout) throws ProgramInvocationException {
		checkNotNull(executorServiceLoader);
		final ClassLoader userCodeClassLoader = program.getUserCodeClassLoader();
		final ClassLoader contextClassLoader = Thread.currentThread().getContextClassLoader();
		try {
			Thread.currentThread().setContextClassLoader(userCodeClassLoader);

			LOG.info("Starting program (detached: {})", !configuration.getBoolean(DeploymentOptions.ATTACHED));

			ContextEnvironment.setAsContext(
				executorServiceLoader,
				configuration,
				userCodeClassLoader,
				enforceSingleJobExecution,
				suppressSysout);

			StreamContextEnvironment.setAsContext(
				executorServiceLoader,
				configuration,
				userCodeClassLoader,
				enforceSingleJobExecution,
				suppressSysout);

			try {
				program.invokeInteractiveModeForExecution();
			} finally {
				ContextEnvironment.unsetAsContext();
				StreamContextEnvironment.unsetAsContext();
			}
		} finally {
			Thread.currentThread().setContextClassLoader(contextClassLoader);
		}
	}

	/**
	 * This method blocks until the job status is not INITIALIZING anymore.
	 * If the job is FAILED, it throws an CompletionException with the failure cause.
	 * @param jobStatusSupplier supplier returning the job status.
	 */
	public static void waitUntilJobInitializationFinished(
		SupplierWithException<JobStatus, Exception> jobStatusSupplier,
		SupplierWithException<JobResult, Exception> jobResultSupplier
		) throws CompletionException {
		LOG.debug("Wait until job initialization is finished");
		WaitStrategy waitStrategy = new ExponentialWaitStrategy(50, 2000);
		try {
			JobStatus status = jobStatusSupplier.get();
			long attempt = 0;
			while (status == JobStatus.INITIALIZING) {
				Thread.sleep(waitStrategy.sleepTime(attempt++));
				status = jobStatusSupplier.get();
			}
			if (status == JobStatus.FAILED) {
				// note: we can not distinguish between initialization failures and failures once
				// execution has started. Execution errors are potentially reported here.
				JobResult result = jobResultSupplier.get();
				Optional<SerializedThrowable> throwable = result.getSerializedThrowable();
				if (throwable.isPresent()) {
					throw new CompletionException(throwable.get().deserializeError(Thread.currentThread().getContextClassLoader()));
				}
			}
		} catch (Exception e) {
			ExceptionUtils.checkInterrupted(e);
			throw new CompletionException("Error while waiting until Job initialization has finished", e);
		}
	}

	public static <T> void waitUntilJobInitializationFinished(ClusterClient<T> client, JobID id) {
		waitUntilJobInitializationFinished(() -> client.getJobStatus(id).get(), () -> client.requestJobResult(id).get());
	}
}
