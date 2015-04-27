package org.apache.flink.streaming.connectors.kafka;

import org.apache.flink.streaming.api.datastream.DataStream;
import org.apache.flink.streaming.api.environment.StreamExecutionEnvironment;
import org.apache.flink.streaming.api.functions.source.FromElementsFunction;
import org.apache.flink.streaming.connectors.kafka.api.persistent.PersistentKafkaSource;
import org.junit.Test;


/**
 * Created by robert on 4/27/15.
 */
public class TypeExtrTest {

	@Test
	public void direct() {
		final StreamExecutionEnvironment env = StreamExecutionEnvironment.createLocalEnvironment(3);
		DataStream<Integer> source = env.addSource(new FromElementsFunction<Integer>(1,2,3));
	}

	@Test
	public void method() {
		final StreamExecutionEnvironment env = StreamExecutionEnvironment.createLocalEnvironment(3);
		readSource(env);
	}

	private void readSource(StreamExecutionEnvironment see) {
		DataStream<Integer> source = see.addSource(new FromElementsFunction<Integer>(1, 2, 3));
	}
}
