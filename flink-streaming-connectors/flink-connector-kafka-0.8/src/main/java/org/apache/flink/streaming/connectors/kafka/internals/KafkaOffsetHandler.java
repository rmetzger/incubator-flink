package org.apache.flink.streaming.connectors.kafka.internals;

import kafka.api.OffsetCommitRequest;
import kafka.consumer.ConsumerConfig;

import java.io.IOException;
import java.util.List;
import java.util.Map;
import java.util.Properties;

public class KafkaOffsetHandler implements OffsetHandler {
	private final Fetcher fetcher;
	/**
	 * (See Kafka protocol):
	 * protocolVersion=0: commit offset to Zookeeper
	 * protocolVersion=1: commit offset to Kafka
	 */
	private short protocolVersion = OffsetCommitRequest.CurrentVersion();

	public KafkaOffsetHandler(Properties properties, Fetcher fetcher) {
		this.fetcher = fetcher;
		switch(properties.getProperty(ConsumerConfig.OffsetsStorage())) {
			case "zookeeper":
				protocolVersion = 0;
				break;
			case "kafka":
				protocolVersion = 1;
				break;
			default:
				protocolVersion = OffsetCommitRequest.CurrentVersion();
				break;
		}
	}

	@Override
	public void commit(Map<KafkaTopicPartition, Long> offsetsToCommit) throws Exception {
		fetcher.commit(offsetsToCommit, this.protocolVersion);
	}

	@Override
	public void seekFetcherToInitialOffsets(List<KafkaTopicPartitionLeader> partitions, Fetcher fetcher) throws Exception {

	}

	@Override
	public void close() throws IOException {
		// noop, the fetcher is closed externally
	}
}
