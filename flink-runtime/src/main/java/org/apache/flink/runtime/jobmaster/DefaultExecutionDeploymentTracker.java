/*
 * Licensed to the Apache Software Foundation (ASF) under one or more
 * contributor license agreements.  See the NOTICE file distributed with
 * this work for additional information regarding copyright ownership.
 * The ASF licenses this file to You under the Apache License, Version 2.0
 * (the "License"); you may not use this file except in compliance with
 * the License.  You may obtain a copy of the License at
 *
 *    http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

package org.apache.flink.runtime.jobmaster;

import org.apache.flink.runtime.clusterframework.types.ResourceID;
import org.apache.flink.runtime.executiongraph.ExecutionAttemptID;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.util.Collections;
import java.util.HashMap;
import java.util.HashSet;
import java.util.Map;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;

/**
 * Default {@link ExecutionDeploymentTracker} implementation.
 */
public class DefaultExecutionDeploymentTracker implements ExecutionDeploymentTracker {
	static final Logger LOG = LoggerFactory.getLogger(DefaultExecutionDeploymentTracker.class);

	private final Set<ExecutionAttemptID> pendingDeployments = new HashSet<>();
	private final Map<ResourceID, Set<ExecutionAttemptID>> executionsByHost = new HashMap<>();
	private final Map<ExecutionAttemptID, ResourceID> hostByExecution = new HashMap<>();

	private final UUID myId = UUID.randomUUID();

	@Override
	public void startTrackingPendingDeploymentOf(ExecutionAttemptID executionAttemptId, ResourceID host) {
		LOG.debug(myId + ": Start tracking pending deployment of " + executionAttemptId);
		pendingDeployments.add(executionAttemptId);
		hostByExecution.put(executionAttemptId, host);
		executionsByHost.computeIfAbsent(host, ignored -> new HashSet<>()).add(executionAttemptId);
		LOG.debug(myId + ": pendingDeployments.size() = " + pendingDeployments.size());
	}

	@Override
	public void completeDeploymentOf(ExecutionAttemptID executionAttemptId) {
		LOG.debug(myId + ": Complete deployment of " + executionAttemptId);
		if (!pendingDeployments.remove(executionAttemptId)) {
			LOG.debug(myId + ": Unable to remove executionAttemptId=" + executionAttemptId);
		}
		LOG.debug(myId + ": pendingDeployments.size() = " + pendingDeployments.size());
	}

	@Override
	public void stopTrackingDeploymentOf(ExecutionAttemptID executionAttemptId) {
		LOG.debug(myId + ": Stop tracking deployment of " + executionAttemptId);
		if (!pendingDeployments.remove(executionAttemptId)) {
			LOG.debug(myId + ": Unable to remove executionAttemptId=" + executionAttemptId);
		}
		ResourceID host = hostByExecution.remove(executionAttemptId);
		if (host != null) {
			executionsByHost.computeIfPresent(host, (resourceID, executionAttemptIds) -> {
				executionAttemptIds.remove(executionAttemptId);

				return executionAttemptIds.isEmpty()
					? null
					: executionAttemptIds;
			});
		}
	}

	@Override
	public Map<ExecutionAttemptID, ExecutionDeploymentState> getExecutionsOn(ResourceID host) {
		LOG.debug(myId + ": executionsByHost = " + executionsByHost + " pendingDeployments = " + pendingDeployments);
		return executionsByHost.getOrDefault(host, Collections.emptySet())
			.stream()
			.collect(Collectors.toMap(
				x -> x,
				x -> pendingDeployments.contains(x) ? ExecutionDeploymentState.PENDING : ExecutionDeploymentState.DEPLOYED));
	}

	@Override
	public int getSize() {
		LOG.debug(myId + ": getSize() executionsByHost = " + executionsByHost.size() + " pendingDeployments = " + pendingDeployments.size() + " hostByExecution = " + hostByExecution.size());
		return executionsByHost.size();
	}
}
