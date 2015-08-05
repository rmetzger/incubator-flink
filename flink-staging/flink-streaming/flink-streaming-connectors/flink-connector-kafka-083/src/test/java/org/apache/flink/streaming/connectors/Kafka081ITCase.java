package org.apache.flink.streaming.connectors;

import org.apache.flink.streaming.connectors.internals.FlinkKafkaConsumerBase;
import org.apache.flink.streaming.util.serialization.DeserializationSchema;

import java.util.Properties;


public class Kafka081ITCase extends KafkaTestBase {
	@Override
	<T> FlinkKafkaConsumerBase<T> getConsumer(String topic, DeserializationSchema deserializationSchema, Properties props) {
		return new FlinkKafkaConsumer081<T>(topic, deserializationSchema, props);
	}
}
