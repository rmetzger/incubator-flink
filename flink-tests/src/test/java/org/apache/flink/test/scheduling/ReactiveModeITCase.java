/*
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

package org.apache.flink.test.scheduling;

import org.apache.flink.api.common.restartstrategy.RestartStrategies;
import org.apache.flink.configuration.ClusterOptions;
import org.apache.flink.configuration.Configuration;
import org.apache.flink.configuration.JobManagerOptions;
import org.apache.flink.configuration.SchedulerExecutionMode;
import org.apache.flink.runtime.minicluster.MiniCluster;
import org.apache.flink.runtime.testutils.MiniClusterResource;
import org.apache.flink.runtime.testutils.MiniClusterResourceConfiguration;
import org.apache.flink.streaming.api.datastream.DataStream;
import org.apache.flink.streaming.api.environment.StreamExecutionEnvironment;
import org.apache.flink.streaming.api.functions.sink.RichSinkFunction;
import org.apache.flink.streaming.api.functions.source.ParallelSourceFunction;
import org.apache.flink.test.util.MiniClusterWithClientResource;
import org.apache.flink.util.TestLogger;

import org.junit.ClassRule;
import org.junit.Test;

import java.util.concurrent.CountDownLatch;

/** Tests for Reactive Mode (FLIP-159). */
public class ReactiveModeITCase extends TestLogger {
    private static final int NUMBER_SLOTS_PER_TASK_MANAGER = 2;
    private static final int INITIAL_NUMBER_TASK_MANAGERS = 1;

    @ClassRule
    public static final MiniClusterResource MINI_CLUSTER_WITH_CLIENT_RESOURCE =
            new MiniClusterWithClientResource(
                    new MiniClusterResourceConfiguration.Builder()
                            .setConfiguration(getReactiveModeConfiguration())
                            .setNumberTaskManagers(INITIAL_NUMBER_TASK_MANAGERS)
                            .setNumberSlotsPerTaskManager(NUMBER_SLOTS_PER_TASK_MANAGER)
                            .build());

    private static Configuration getReactiveModeConfiguration() {
        final Configuration conf = new Configuration();

        conf.set(JobManagerOptions.SCHEDULER, JobManagerOptions.SchedulerType.Adaptive);
        conf.set(JobManagerOptions.SCHEDULER_MODE, SchedulerExecutionMode.REACTIVE);
        conf.set(ClusterOptions.ENABLE_DECLARATIVE_RESOURCE_MANAGEMENT, true);

        return conf;
    }

    @Test
    public void testScaleUpAndDownWithMaxParallelism() throws Exception {
        StreamExecutionEnvironment env = StreamExecutionEnvironment.getExecutionEnvironment();
        env.setRestartStrategy(RestartStrategies.fixedDelayRestart(Integer.MAX_VALUE, 0L));
        final DataStream<String> input = env.addSource(new ParallelismTrackingSource());
        // we set maxParallelism = 1 and assert it never exceeds it
        input.addSink(new ParallelismTrackingSink<>()).getTransformation().setMaxParallelism(1);

        ParallelismTrackingSource.expectInstances(NUMBER_SLOTS_PER_TASK_MANAGER);
        ParallelismTrackingSink.expectInstances(1);

        env.executeAsync();

        ParallelismTrackingSource.waitForInstances();
        ParallelismTrackingSink.waitForInstances();
        ParallelismTrackingSource.expectInstances(2 * NUMBER_SLOTS_PER_TASK_MANAGER);
        ParallelismTrackingSink.expectInstances(1);

        final MiniCluster miniCluster = MINI_CLUSTER_WITH_CLIENT_RESOURCE.getMiniCluster();

        // add additional TaskManager
        miniCluster.startTaskManager();

        ParallelismTrackingSource.waitForInstances();
        ParallelismTrackingSink.waitForInstances();
        // prepare for and scale down
        ParallelismTrackingSource.expectInstances(NUMBER_SLOTS_PER_TASK_MANAGER);
        ParallelismTrackingSink.expectInstances(1);

        miniCluster.terminateTaskManager(0);

        ParallelismTrackingSource.waitForInstances();
        ParallelismTrackingSink.waitForInstances();
    }

    private static class ParallelismTrackingSource implements ParallelSourceFunction<String> {
        private volatile boolean running = true;

        private static volatile CountDownLatch instances;

        public static void expectInstances(int count) {
            instances = new CountDownLatch(count);
        }

        public static void waitForInstances() throws InterruptedException {
            instances.await();
        }

        @Override
        public void run(SourceContext<String> ctx) throws Exception {
            instances.countDown();
            while (running) {
                synchronized (ctx.getCheckpointLock()) {
                    ctx.collect("test");
                }
                Thread.sleep(100);
            }
        }

        @Override
        public void cancel() {
            running = false;
        }
    }

    private static class ParallelismTrackingSink<T> extends RichSinkFunction<T> {
        private static volatile CountDownLatch instances;

        public static void expectInstances(int count) {
            instances = new CountDownLatch(count);
        }

        public static void waitForInstances() throws InterruptedException {
            instances.await();
        }

        @Override
        public void open(Configuration parameters) throws Exception {
            instances.countDown();
        }
    }
}
