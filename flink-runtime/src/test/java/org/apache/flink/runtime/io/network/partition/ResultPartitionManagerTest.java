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
import org.junit.Test;

import java.util.List;
import java.util.concurrent.Callable;
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

		final ResultPartitionManager partitionManager = new ResultPartitionManager();

		ResultPartition[] partitions = new ResultPartition[16384];
		for (int i = 0; i < partitions.length; i++) {
			partitions[i] = mock(ResultPartition.class);
			when(partitions[i].getPartitionId()).thenReturn(new ResultPartitionID());

			partitionManager.registerResultPartition(partitions[i]);
		}

		ExecutorService executorService = null;

		try {
			executorService = Executors.newFixedThreadPool(16);

			List<Future<?>> results = Lists.newArrayListWithCapacity(partitions.length);

			for(final ResultPartition partition : partitions) {
				results.add(executorService.submit(new Callable<Void>() {
					@Override
					public Void call() throws Exception {
						partitionManager.releasePartitionsProducedBy(partition
								.getPartitionId().getProducerId());

						return null;
					}
				}));
			}

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
