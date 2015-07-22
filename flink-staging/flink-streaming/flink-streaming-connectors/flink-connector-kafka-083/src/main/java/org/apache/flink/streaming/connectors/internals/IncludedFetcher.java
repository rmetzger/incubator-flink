package org.apache.flink.streaming.connectors.internals;

import org.apache.flink.streaming.api.functions.source.SourceFunction;
import org.apache.flink.streaming.util.serialization.DeserializationSchema;
import org.apache.kafka.copied.clients.consumer.CommitType;
import org.apache.kafka.copied.clients.consumer.ConsumerRecord;
import org.apache.kafka.copied.clients.consumer.ConsumerRecords;
import org.apache.kafka.copied.clients.consumer.KafkaConsumer;
import org.apache.kafka.copied.common.TopicPartition;
import org.apache.kafka.copied.common.serialization.ByteArrayDeserializer;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.util.List;
import java.util.Map;
import java.util.Properties;

public class IncludedFetcher implements Fetcher {
	public static Logger LOG = LoggerFactory.getLogger(IncludedFetcher.class);

	public final static String POLL_TIMEOUT = "flink.kafka.consumer.poll.timeout";
	public final static long DEFAULT_POLL_TIMEOUT = 50;

	final KafkaConsumer<byte[], byte[]> fetcher;
	final Properties props;
	boolean running = true;

	public IncludedFetcher(Properties props) {
		this.props = props;
		fetcher = new KafkaConsumer<byte[], byte[]>(props, null, new ByteArrayDeserializer(), new ByteArrayDeserializer());
	}

	@Override
	public void partitionsToRead(List<TopicPartition> partitions) {
		fetcher.subscribe(partitions.toArray(new TopicPartition[partitions.size()]));
	}

	@Override
	public void close() {
		synchronized (fetcher) {
			fetcher.close();
		}
	}

	@Override
	public <T> void run(SourceFunction.SourceContext<T> sourceContext, DeserializationSchema<T> valueDeserializer, long[] lastOffsets) {
		long pollTimeout = DEFAULT_POLL_TIMEOUT;
		if(props.contains(POLL_TIMEOUT)) {
			pollTimeout = Long.valueOf(props.getProperty(POLL_TIMEOUT));
		}
		while(running) {
			synchronized (fetcher) {
				ConsumerRecords<byte[], byte[]> consumed = fetcher.poll(pollTimeout);
				if(!consumed.isEmpty()) {
					synchronized (sourceContext.getCheckpointLock()) {
						for(ConsumerRecord<byte[], byte[]> record : consumed) {
							T value = valueDeserializer.deserialize(record.value());
							sourceContext.collect(value);
							lastOffsets[record.partition()] = record.offset();
						}
					}
				}
			}
		}
	}

	@Override
	public void stop() {
		running = false;
	}

	@Override
	public void commit(Map<TopicPartition, Long> offsetsToCommit) {
		synchronized (fetcher) {
			fetcher.commit(offsetsToCommit, CommitType.SYNC);
		}
	}

	@Override
	public void seek(TopicPartition topicPartition, long offset) {
		fetcher.seek(topicPartition, offset);
	}
}
