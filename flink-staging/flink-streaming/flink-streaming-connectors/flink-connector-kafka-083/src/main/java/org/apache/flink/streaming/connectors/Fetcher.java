package org.apache.flink.streaming.connectors;

import org.apache.flink.streaming.api.functions.source.SourceFunction;
import org.apache.flink.streaming.util.serialization.DeserializationSchema;
import org.apache.kafka.copied.common.TopicPartition;

import java.util.List;
import java.util.Map;

public interface Fetcher {

	void partitionsToRead(List<FlinkPartitionInfo> partitions);

	void close();

	<T> void run(SourceFunction.SourceContext<T> sourceContext, DeserializationSchema<T> valueDeserializer, long[] lastOffsets);

	void stop();

	void commit(Map<TopicPartition, Long> offsetsToCommit);

	void seek(FlinkPartitionInfo topicPartition, long offset);
}
