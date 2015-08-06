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

package org.apache.flink.test.checkpointing;

import org.apache.flink.configuration.ConfigConstants;
import org.apache.flink.configuration.Configuration;
import org.apache.flink.streaming.api.checkpoint.Checkpointed;
import org.apache.flink.streaming.api.datastream.DataStream;
import org.apache.flink.streaming.api.environment.StreamExecutionEnvironment;
import org.apache.flink.streaming.api.functions.sink.RichSinkFunction;
import org.apache.flink.streaming.api.functions.source.RichParallelSourceFunction;
import org.apache.flink.test.util.ForkableFlinkMiniCluster;
import org.junit.AfterClass;
import org.junit.Assert;
import org.junit.BeforeClass;
import org.junit.Test;

import static org.junit.Assert.fail;

/**
 * This test ensures that the snapshotState method is always called, also in cases
 * where the parallelism between operators changes.
 */
@SuppressWarnings("serial")
public class ParallelismChangeCheckpoinedITCase {

	private static final int NUM_TASK_MANAGERS = 2;
	private static final int NUM_TASK_SLOTS = 3;
	private static final int PARALLELISM = NUM_TASK_MANAGERS * NUM_TASK_SLOTS;

	private static ForkableFlinkMiniCluster cluster;

	@BeforeClass
	public static void startCluster() {
		try {
			Configuration config = new Configuration();
			config.setInteger(ConfigConstants.LOCAL_INSTANCE_MANAGER_NUMBER_TASK_MANAGER, NUM_TASK_MANAGERS);
			config.setInteger(ConfigConstants.TASK_MANAGER_NUM_TASK_SLOTS, NUM_TASK_SLOTS);
			config.setString(ConfigConstants.DEFAULT_EXECUTION_RETRY_DELAY_KEY, "0 ms");
			config.setInteger(ConfigConstants.TASK_MANAGER_MEMORY_SIZE_KEY, 12);
			
			cluster = new ForkableFlinkMiniCluster(config, false);
		}
		catch (Exception e) {
			e.printStackTrace();
			fail("Failed to start test cluster: " + e.getMessage());
		}
	}

	@AfterClass
	public static void shutdownCluster() {
		try {
			cluster.shutdown();
			cluster = null;
		}
		catch (Exception e) {
			e.printStackTrace();
			fail("Failed to stop test cluster: " + e.getMessage());
		}
	}

	private static boolean snapshotInSink = false;

	/**
	 * Runs the following program:
	 *
	 * <pre>
	 *     [ (source)->(filter)->(map) ] -> [ (map) ] -> [ (groupBy/reduce)->(sink) ]
	 * </pre>
	 */
	@Test
	public void runCheckpointedProgram() {

		try {
			StreamExecutionEnvironment env = StreamExecutionEnvironment.createRemoteEnvironment(
																	"localhost", cluster.getJobManagerRPCPort());
			env.setParallelism(PARALLELISM);
			env.enableCheckpointing(50);
			env.getConfig().disableSysoutLogging();

			DataStream<Integer> stream = env.addSource(new Source()).setParallelism(4);

			stream.addSink(new ValidatingSink()).setParallelism(1);

			env.execute();

			Assert.assertTrue("Snapshot has never been called in the sink", snapshotInSink);
		}
		catch (Exception e) {
			e.printStackTrace();
			fail(e.getMessage());
		}
	}
	
	// --------------------------------------------------------------------------------------------
	//  Custom Functions
	// --------------------------------------------------------------------------------------------

	private static class Source extends RichParallelSourceFunction<Integer> implements Checkpointed<Integer> {
		@Override
		public void run(SourceContext<Integer> ctx) throws Exception {
			// let only one source generate data
			if(getRuntimeContext().getIndexOfThisSubtask() != 0) {
				return;
			}
			int id = 0;
			while(id < 500) {
				Thread.sleep(1);
				ctx.collect(id++);
			}
		}

		@Override
		public void cancel() {

		}

		@Override
		public Integer snapshotState(long checkpointId, long checkpointTimestamp) throws Exception {
			System.out.println("snapshot state in source");
			return null;
		}

		@Override
		public void restoreState(Integer state) {

		}
	}
	
	private static class ValidatingSink extends RichSinkFunction<Integer>
			implements Checkpointed<ValidatingSink> {


		@Override
		public void invoke(Integer value) {

		}

		@Override
		public void close() throws Exception {
		}

		@Override
		public ValidatingSink snapshotState(long checkpointId, long checkpointTimestamp) {
			System.out.println("Snapshot called");
			snapshotInSink = true;
			return this;
		}

		@Override
		public void restoreState(ValidatingSink state) {
		}
	}
}
