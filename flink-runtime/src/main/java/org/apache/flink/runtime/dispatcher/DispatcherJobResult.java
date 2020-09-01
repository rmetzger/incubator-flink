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

import org.apache.flink.runtime.executiongraph.ArchivedExecutionGraph;
import org.apache.flink.util.Preconditions;

import javax.annotation.Nullable;

/**
 * TODO.
 */
public abstract class DispatcherJobResult {
	private final boolean initializationFailure;

	private DispatcherJobResult(boolean initializationFailure) {
		this.initializationFailure = initializationFailure;
	}

	public boolean isInitializationFailure() {
		return initializationFailure;
	}

	public DispatcherJobResultInitializationFailure asFailure() {
		Preconditions.checkArgument(initializationFailure);
		//noinspection CastToConcreteClass
		return (DispatcherJobResultInitializationFailure) this;
	}

	public DispatcherJobResultInitializationSuccess asSuccess() {
		Preconditions.checkArgument(!initializationFailure);
		//noinspection CastToConcreteClass
		return (DispatcherJobResultInitializationSuccess) this;
	}

	public static class DispatcherJobResultInitializationFailure extends DispatcherJobResult {
		private final Throwable throwable;
		private final long initializationTimestamp;

		private DispatcherJobResultInitializationFailure(
			Throwable throwable,
			long initializationTimestamp) {
			super(true);
			this.throwable = throwable;
			this.initializationTimestamp = initializationTimestamp;
		}

		public long getInitializationTimestamp() {
			return this.initializationTimestamp;
		}

		public Throwable getThrowable() {
			return throwable;
		}
	}

	public static class DispatcherJobResultInitializationSuccess extends DispatcherJobResult {
		@Nullable
		private final ArchivedExecutionGraph archivedExecutionGraph;
		@Nullable
		private final Throwable throwable;

		private DispatcherJobResultInitializationSuccess(
			@Nullable ArchivedExecutionGraph archivedExecutionGraph,
			@Nullable Throwable throwable) {
			super(false);
			Preconditions.checkArgument(archivedExecutionGraph == null ^ throwable == null);
			this.archivedExecutionGraph = archivedExecutionGraph;
			this.throwable = throwable;
		}

		public ArchivedExecutionGraph getArchivedExecutionGraphOrThrow() throws Throwable {
			if (archivedExecutionGraph != null) {
				return archivedExecutionGraph;
			} else {
				throw throwable;
			}
		}

		public Throwable getThrowable() {
			return throwable;
		}

		public boolean hasThrowable() {
			return throwable != null;
		}

		public ArchivedExecutionGraph getArchivedExecutionGraph() {
			return archivedExecutionGraph;
		}
	}

	public static DispatcherJobResultInitializationFailure createFailureResult(Throwable throwable,
		long initializationTimestamp) {
		return new DispatcherJobResultInitializationFailure(throwable, initializationTimestamp);
	}

	public static DispatcherJobResultInitializationSuccess createSuccessResult(@Nullable ArchivedExecutionGraph archivedExecutionGraph,
		@Nullable Throwable throwable) {
		return new DispatcherJobResultInitializationSuccess(archivedExecutionGraph, throwable);
	}
}
