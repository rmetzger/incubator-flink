package org.apache.flink.streaming.connectors.kinesis;

import org.apache.flink.api.common.restartstrategy.RestartStrategies;
import org.apache.flink.api.common.serialization.SimpleStringSchema;
import org.apache.flink.configuration.Configuration;
import org.apache.flink.runtime.client.JobExecutionException;
import org.apache.flink.runtime.jobgraph.JobGraph;
import org.apache.flink.runtime.minicluster.MiniCluster;
import org.apache.flink.runtime.minicluster.MiniClusterConfiguration;
import org.apache.flink.streaming.api.datastream.DataStream;
import org.apache.flink.streaming.api.environment.StreamExecutionEnvironment;
import org.apache.flink.streaming.api.functions.source.SourceFunction;
import org.apache.flink.streaming.connectors.kinesis.config.AWSConfigConstants;
import org.apache.flink.util.TestLogger;

import org.junit.Test;

import java.net.URL;
import java.util.Properties;

/**
 * NOTE: This test requires kinesalite. Start it with:
 *
 *     docker run -d --rm --entrypoint "/tini" \
 *         --name flink-test-kinesis \
 *         -p 4567:4567 \
 *         instructure/kinesalite -- \
 *         /usr/src/app/node_modules/kinesalite/cli.js --path /var/lib/kinesalite --ssl
 *
 *  Create topic first:
 *
 *  AWS_ACCESS_KEY_ID=x AWS_SECRET_ACCESS_KEY=x aws --no-verify-ssl --endpoint-url https://localhost:4567/ kinesis create-stream --stream-name=kinesis_stream_name --shard-count=1
 *
 *  JVM config:
 *  -ea -Xmx500m -XX:+UseG1GC -XX:MaxMetaspaceSize=47843540 -XX:+ExitOnOutOfMemoryError
 *
 *  Notes:
 *  - Runs at least 440 seconds with discarding sink (manually cancelled)
 *  - Fails after ~40 seconds with Kinesis Producer (OutOfMemoryError: Metaspace)
 *
 *  - fails after 4 submissions (10 seconds) (with unload thingy)
 *  - fails after 10 submissions (xx seconds) (without unload thingy)
 */
public class KinesisMemoryLeakTest extends TestLogger {

	private final static Configuration conf = new Configuration();
	static {
		conf.setBoolean("classloader.check-leaked-classloader", false);
	}
	private static final MiniCluster MINI_CLUSTER = new MiniCluster(
		new MiniClusterConfiguration.Builder()
			.setNumTaskManagers(1)
			.setNumSlotsPerTaskManager(2)
			.setConfiguration(conf)
			.build());
	@Test
	public void triggerMemoryLeak() throws Exception {
		final String streamName = "kinesis_stream_name";
		Properties producerConfig = new Properties();

		producerConfig.put(AWSConfigConstants.AWS_CREDENTIALS_PROVIDER, AWSConfigConstants.CredentialProvider.BASIC.name());
		producerConfig.put(AWSConfigConstants.AWS_REGION, "us-east-1");
		producerConfig.put(AWSConfigConstants.AWS_ACCESS_KEY_ID, "fakeid");
		producerConfig.put(AWSConfigConstants.AWS_SECRET_ACCESS_KEY, "fakekey");
		producerConfig.put(AWSConfigConstants.AWS_ENDPOINT, "http://localhost:4567");
		String kinesisUrl = producerConfig.getProperty(AWSConfigConstants.AWS_ENDPOINT);
		if (kinesisUrl != null) {
			URL url = new URL(kinesisUrl);
			producerConfig.put("KinesisEndpoint", url.getHost());
			producerConfig.put("KinesisPort", Integer.toString(url.getPort()));
			producerConfig.put("VerifyCertificate", "false");
		}

		//KinesisPubsubClient pubsub = new KinesisPubsubClient(producerConfig);
		//pubsub.createTopic(streamName, 2, producerConfig);

		MINI_CLUSTER.start();

		StreamExecutionEnvironment see = StreamExecutionEnvironment.getExecutionEnvironment();
		see.setParallelism(1);
		//see.setRestartStrategy(RestartStrategies.fixedDelayRestart(10_000, 0L));
		see.setRestartStrategy(RestartStrategies.noRestart());
		DataStream<String> source = see.addSource(
			new SourceFunction<String>() {

				private boolean running = true;

				@Override
				public void run(SourceContext<String> ctx) throws Exception {
					long cnt = 0;
					while (running) {
						ctx.collect("kinesis-" + cnt);
						cnt++;
						if (cnt % 100 == 0) {
							throw new RuntimeException("Artifical test failure");
							// Thread.sleep(10);
						}
					}
				}

				@Override
				public void cancel() {
					running = false;
				}
			});



		FlinkKinesisProducer<String> kinesis = new FlinkKinesisProducer<>(new SimpleStringSchema(), producerConfig);
		kinesis.setFailOnError(true);
		kinesis.setDefaultStream(streamName);
		kinesis.setDefaultPartition("0");

		source.addSink(kinesis); // new DiscardingSink<>()
		//source.addSink(new DiscardingSink<>());

		JobGraph jg = see.getStreamGraph().getJobGraph();

		// yolo
		while (true) {
			try {
				MINI_CLUSTER.executeJobBlocking(jg);
			} catch (JobExecutionException jee) {
				log.info("Observed expected failure");
			}
		}

		// MINI_CLUSTER.close();
	}
}
