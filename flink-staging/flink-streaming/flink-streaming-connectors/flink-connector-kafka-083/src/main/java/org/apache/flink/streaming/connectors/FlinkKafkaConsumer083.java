package org.apache.flink.streaming.connectors;

import org.apache.flink.streaming.connectors.internals.FlinkKafkaConsumerBase;
import org.apache.flink.streaming.util.serialization.DeserializationSchema;

import java.util.Properties;

public class FlinkKafkaConsumer083<T> extends FlinkKafkaConsumerBase<T> {

	public FlinkKafkaConsumer083(String topic, DeserializationSchema<T> valueDeserializer, Properties props) {
		super(topic, valueDeserializer, props);
		this.offsetStore = OffsetStore.BROKER_COORDINATOR;
		this.fetcherType = FetcherType.INCLUDED;
	}
}
