package org.apache.flink.streaming.connectors.kinesis;

import org.apache.flink.api.common.JobSubmissionResult;
import org.apache.flink.api.java.tuple.Tuple2;
import org.apache.flink.runtime.minicluster.MiniCluster;
import org.apache.flink.runtime.minicluster.MiniClusterConfiguration;
import org.apache.flink.streaming.api.datastream.DataStream;
import org.apache.flink.streaming.api.environment.StreamExecutionEnvironment;
import org.apache.flink.streaming.api.functions.source.SourceFunction;

import org.junit.Test;

import java.util.concurrent.CompletableFuture;

public class KinesisMemoryLeakTest {

	private static final MiniCluster MINI_CLUSTER = new MiniCluster(
		new MiniClusterConfiguration.Builder()
			.setNumTaskManagers(1)
			.setNumSlotsPerTaskManager(2)
			.build());
	@Test
	public void triggerMemoryLeak() throws Exception {
		MINI_CLUSTER.start();

		StreamExecutionEnvironment see = StreamExecutionEnvironment.getExecutionEnvironment();
		see.setParallelism(1);
		DataStream<Tuple2<Long, String>> source = see.addSource(
			new SourceFunction<Tuple2<Long, String>>() {

				private boolean running = true;

				@Override
				public void run(SourceContext<Tuple2<Long, String>> ctx) throws Exception {
					long cnt = 0;
					while (running) {
						ctx.collect(new Tuple2<>(cnt, "kinesis-" + cnt));
						cnt++;
						if (cnt % 100 == 0) {
							Thread.sleep(10);
						}
					}
				}

				@Override
				public void cancel() {
					running = false;
				}
			});
		source.print();

		CompletableFuture<JobSubmissionResult> res = MINI_CLUSTER.submitJob(
			see.getStreamGraph().getJobGraph());

		res.get();

		Thread.sleep(5000);

		MINI_CLUSTER.close();
	}
}
