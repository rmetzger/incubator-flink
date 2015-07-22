package org.apache.flink.streaming.connectors.internals;

import org.apache.flink.streaming.api.functions.source.SourceFunction;
import org.apache.flink.streaming.util.serialization.DeserializationSchema;
import org.apache.kafka.copied.common.TopicPartition;

import java.util.List;
import java.util.Map;

public interface Fetcher {

	/**
	 * Set which partitions we want to read from
	 * @param partitions
	 */
	void partitionsToRead(List<TopicPartition> partitions);

	/**
	 * Ask the run() method to stop reading
	 */
	void stop();

	/**
	 * Close the underlying connection
	 */
	void close();

	/**
	 * Start and fetch indefinitely from the underlying fetcher
	 * @param sourceContext
	 * @param valueDeserializer
	 * @param lastOffsets
	 * @param <T>
	 */
	<T> void run(SourceFunction.SourceContext<T> sourceContext, DeserializationSchema<T> valueDeserializer, long[] lastOffsets);

	/**
	 * Commit offset (if supported)
	 * @param offsetsToCommit
	 */
	void commit(Map<TopicPartition, Long> offsetsToCommit);

	/**
	 * Set offsets for the partitions
	 */
	void seek(TopicPartition topicPartition, long offset);
}
