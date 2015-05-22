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

package org.apache.flink.runtime.io.network.partition;

import com.google.common.collect.Maps;
import org.apache.flink.runtime.executiongraph.ExecutionAttemptID;
import org.apache.flink.runtime.io.network.buffer.BufferProvider;
import org.apache.flink.runtime.jobgraph.IntermediateResultPartitionID;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.io.IOException;
import java.util.Arrays;
import java.util.Map;

import static com.google.common.base.Preconditions.checkNotNull;
import static com.google.common.base.Preconditions.checkState;

/**
 * The result partition manager keeps track of all currently produced/consumed partitions of a
 * task manager.
 */
public class ResultPartitionManager implements ResultPartitionProvider {

	private static final Logger LOG = LoggerFactory.getLogger(ResultPartitionManager.class);

	Map<ExecutionAttemptID, Map<IntermediateResultPartitionID, ResultPartition>>
			registeredPartitions = Maps.newHashMap();

	private boolean isShutdown;

	public void registerResultPartitions(
			ExecutionAttemptID executionId,
			ResultPartition[] partitions)
			throws IOException {

		Map<IntermediateResultPartitionID, ResultPartition> newPartitions = Maps.newHashMap();

		for (ResultPartition partition : partitions) {
			newPartitions.put(partition.getPartitionId().getPartitionId(), partition);
		}

		synchronized (registeredPartitions) {
			checkState(!isShutdown, "Result partition manager already shut down.");

			Map<IntermediateResultPartitionID, ResultPartition> prev =
					this.registeredPartitions.put(executionId, newPartitions);

			if (prev != null) {
				throw new IllegalStateException("Result partition already registered.");
			}

			LOG.debug("Registered partitions: {}.", Arrays.toString(partitions));
		}
	}

	@Override
	public ResultSubpartitionView createSubpartitionView(
			ResultPartitionID partitionId,
			int subpartitionIndex,
			BufferProvider bufferProvider) throws IOException {

		ResultPartition partition;

		synchronized (registeredPartitions) {
			Map<IntermediateResultPartitionID, ResultPartition> producerPartitions =
					registeredPartitions.get(partitionId.getProducerId());

			partition = producerPartitions != null
					? producerPartitions.get(partitionId.getPartitionId())
					: null;
		}

		if (partition == null) {
			throw new PartitionNotFoundException(partitionId);
		}

		LOG.debug("Requesting subpartition {} of {}.", subpartitionIndex, partition);

		return partition.createSubpartitionView(subpartitionIndex, bufferProvider);
	}

	public void releasePartitionsProducedBy(ExecutionAttemptID executionId) {

		Map<IntermediateResultPartitionID, ResultPartition> partitions;

		synchronized (registeredPartitions) {
			partitions = registeredPartitions.remove(executionId);
		}

		if (partitions != null) {
			for (ResultPartition partition : partitions.values()) {
				partition.release();
			}

			partitions.clear();
		}

		LOG.debug("Released all partitions produced by {}.", executionId);
	}

	public void shutdown() {
		synchronized (registeredPartitions) {
			LOG.debug("Releasing partitions of {} producers because of shutdown.",
					registeredPartitions.values().size());

			for (Map<IntermediateResultPartitionID, ResultPartition> partitions
					: registeredPartitions.values()) {

				for (ResultPartition partition : partitions.values()) {
					partition.release();
				}

				partitions.clear();
			}

			registeredPartitions.clear();

			isShutdown = true;

			LOG.debug("Successful shutdown.");
		}
	}

	// ------------------------------------------------------------------------
	// Notifications
	// ------------------------------------------------------------------------

	void onConsumedPartition(ResultPartition partition) {
		checkNotNull(partition);

		final ResultPartition previous;

		LOG.debug("Received consume notification from {}.", partition);

		synchronized (registeredPartitions) {
			ResultPartitionID partitionId = partition.getPartitionId();

			Map<IntermediateResultPartitionID, ResultPartition> partitions =
					registeredPartitions.get(partitionId.getProducerId());

			previous = partitions != null ? partitions.remove(partitionId.getPartitionId()) : null;
		}

		// Release the partition if it was successfully removed
		if (partition == previous) {
			partition.release();

			LOG.debug("Released {}.", partition);
		}
	}
}
