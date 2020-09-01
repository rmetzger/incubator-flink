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

import javax.annotation.Nullable;

/**
 * Container for returning the ArchivedExecutionGraph and a flag whether the initialization failed.
 * For initialization failures, the throwable is also attached, to avoid deserializing it from the ArchivedExecutionGraph.
 */
public class DispatcherJobResult {
	private final boolean initializationFailure;
	private final ArchivedExecutionGraph archivedExecutionGraph;
	@Nullable
	private final Throwable throwable;

	private DispatcherJobResult(ArchivedExecutionGraph archivedExecutionGraph, Throwable throwable, boolean initializationFailure) {
		this.archivedExecutionGraph = archivedExecutionGraph;
		this.initializationFailure = initializationFailure;
		this.throwable = throwable;
	}

	public boolean isInitializationFailure() {
		return initializationFailure;
	}

	public ArchivedExecutionGraph getArchivedExecutionGraph() {
		return archivedExecutionGraph;
	}

	public Throwable getThrowable() {
		return throwable;
	}

	public static DispatcherJobResult forInitializationFailure(ArchivedExecutionGraph archivedExecutionGraph, Throwable throwable) {
		return new DispatcherJobResult(archivedExecutionGraph, throwable, true);
	}

	public static DispatcherJobResult forSuccess(ArchivedExecutionGraph archivedExecutionGraph) {
		return new DispatcherJobResult(archivedExecutionGraph, null, false);
	}
}
