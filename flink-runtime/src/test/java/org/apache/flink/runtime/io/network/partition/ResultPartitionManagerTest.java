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

import com.google.common.collect.Lists;
import org.apache.flink.runtime.executiongraph.ExecutionAttemptID;
import org.apache.flink.runtime.jobgraph.IntermediateResultPartitionID;
import org.junit.Test;

import java.util.Arrays;
import java.util.List;
import java.util.concurrent.Callable;
import java.util.concurrent.CountDownLatch;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.concurrent.Future;

import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

public class ResultPartitionManagerTest {

	@Test
	public void testReleasePartitionsProducedBy() throws Exception {
		// Config
		final int tasks = 16;
		final int partitionsPerTask = 16;

		final ResultPartitionManager partitionManager = new ResultPartitionManager();

		ResultPartition[] partitions = new ResultPartition[tasks * partitionsPerTask];
		ExecutionAttemptID[] taskIds = new ExecutionAttemptID[tasks];

		for (int i = 0; i < tasks; i++) {
			taskIds[i] = new ExecutionAttemptID();

			for (int j = 0; j < partitionsPerTask; j++) {
				ResultPartition partition = mock(ResultPartition.class);
				when(partition.getPartitionId()).thenReturn(
						new ResultPartitionID(new IntermediateResultPartitionID(), taskIds[i]));

				partitions[i * partitionsPerTask + j] = partition;
			}

			partitionManager.registerResultPartitions(
					taskIds[i],
					Arrays.copyOfRange(
							partitions,
							i * partitionsPerTask,
							i * partitionsPerTask + partitionsPerTask)
			);
		}

		ExecutorService executorService = null;

		try {
			executorService = Executors.newFixedThreadPool(tasks);

			List<Future<?>> results = Lists.newArrayListWithCapacity(partitions.length);

			final CountDownLatch sync = new CountDownLatch(tasks + 1);

			for(final ExecutionAttemptID eid : taskIds) {
				results.add(executorService.submit(new Callable<Void>() {
					@Override
					public Void call() throws Exception {
						sync.countDown();
						sync.await();

						partitionManager.releasePartitionsProducedBy(eid);

						return null;
					}
				}));
			}

			sync.countDown();

			// Wait for all results
			for (Future<?> f : results) {
				f.get();
			}

			// Verify that all partitions have been released
			for (ResultPartition partition : partitions) {
				verify(partition, times(1)).release();
			}
		}
		finally {
			executorService.shutdown();
		}
	}
}
