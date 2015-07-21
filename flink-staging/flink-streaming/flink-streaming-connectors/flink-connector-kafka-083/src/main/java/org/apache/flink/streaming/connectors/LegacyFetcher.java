package org.apache.flink.streaming.connectors;

import kafka.javaapi.consumer.SimpleConsumer;
import org.apache.flink.streaming.api.functions.source.SourceFunction;
import org.apache.flink.streaming.util.serialization.DeserializationSchema;
import org.apache.kafka.copied.common.TopicPartition;

import java.util.List;
import java.util.Map;
import java.util.Properties;

/**
 * Created by robert on 7/21/15.
 */
public class LegacyFetcher implements Fetcher {
	public LegacyFetcher(Properties props) {
	}

	@Override
	public void partitionsToRead(List<FlinkPartitionInfo> partitions) {

	}

	@Override
	public void close() {

	}

	@Override
	public <T> void run(SourceFunction.SourceContext<T> sourceContext, DeserializationSchema<T> valueDeserializer, long[] lastOffsets) {

	}

	@Override
	public void stop() {

	}

	@Override
	public void commit(Map<TopicPartition, Long> offsetsToCommit) {

	}

	@Override
	public void seek(FlinkPartitionInfo topicPartition, long offset) {

	}
}
