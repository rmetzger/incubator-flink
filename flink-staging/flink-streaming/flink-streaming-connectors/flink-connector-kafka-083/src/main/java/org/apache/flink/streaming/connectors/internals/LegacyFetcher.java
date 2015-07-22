package org.apache.flink.streaming.connectors.internals;

import kafka.api.FetchRequestBuilder;
import kafka.javaapi.consumer.SimpleConsumer;
import org.apache.flink.streaming.api.functions.source.SourceFunction;
import org.apache.flink.streaming.util.serialization.DeserializationSchema;
import org.apache.kafka.copied.common.Node;
import org.apache.kafka.copied.common.PartitionInfo;
import org.apache.kafka.copied.common.TopicPartition;
import org.apache.kafka.copied.common.requests.FetchRequest;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Properties;

public class LegacyFetcher implements Fetcher {

	private final String topic;
	private Map<TopicPartition, Long> partitionsToRead;
	private boolean running = true;
	private Properties config;

	public LegacyFetcher(String topic, Properties props) {
		config = props;
		this.topic = topic;
	}

	@Override
	public void partitionsToRead(List<TopicPartition> partitions) {
		partitionsToRead = new HashMap<TopicPartition, Long>(partitions.size());
		for(TopicPartition tp: partitions) {
			partitionsToRead.put(tp, -1L);
		}
	}

	@Override
	public void close() {

	}

	@Override
	public <T> void run(SourceFunction.SourceContext<T> sourceContext, DeserializationSchema<T> valueDeserializer, long[] lastOffsets) {
		if(partitionsToRead == null || partitionsToRead.size() == 0) {
			throw new IllegalArgumentException("No partitions set");
		}

		// get lead broker for each partition
		List<PartitionInfo> allPartitionsInTopic = FlinkKafkaConsumerBase.getPartitionsForTopic(topic, config);

		// brokers to fetch partitions from.
		int fetchPartitionsCount = 0;
		Map<Node, List<FetchPartition>> fetchBrokers = new HashMap<Node, List<FetchPartition>>();
		for(PartitionInfo partitionInfo : allPartitionsInTopic) {
			for(Map.Entry<TopicPartition, Long> partitionToRead: partitionsToRead.entrySet()) {
				if(partitionToRead.getKey().partition() == partitionInfo.partition()) {
					List<FetchPartition> partitions = fetchBrokers.get(partitionInfo.leader());
					if(partitions == null) {
						partitions = new ArrayList<FetchPartition>();
					}
					FetchPartition fp = new FetchPartition();
					fp.offset = partitionToRead.getValue();
					fp.partition = partitionToRead.getKey().partition();
					partitions.add(fp);
					fetchPartitionsCount++;
				}
			}
		}
		if(partitionsToRead.size() != fetchPartitionsCount) {
			throw new RuntimeException(partitionsToRead.size() + " partitions to read, but got only "+fetchPartitionsCount+" partition infos with lead brokers.");
		}
		// create SimpleConsumers for each partition

		// these are the actual configuration values of Kafka + their original default values.
		int soTimeout = Integer.valueOf(config.getProperty("socket.timeout.ms", "30000"));
		int bufferSize = Integer.valueOf(config.getProperty("socket.receive.buffer.bytes", "65536"));
		List<SimpleConsumer> consumers = new ArrayList<SimpleConsumer>(fetchPartitions.size());
		for(int i = 0; i < fetchPartitions.size(); i++) {
			FetchPartition fp = fetchPartitions.get(i);
			String clientId = "flink-kafka-consumer-legacy-"+topic+"-"+fp.partition;
			consumers.add(new SimpleConsumer(fp.leaderHost, fp.leaderPort, soTimeout, bufferSize, clientId));
		}
		add threads and a LinkedBlockingQueue here
		FetchRequest fetchRequest = new FetchRequestBuilder()
				.clientId(consumers.get(0).clientId()).addFetch()
	}

	@Override
	public void stop() {
		running = false;
	}

	@Override
	public void commit(Map<TopicPartition, Long> offsetsToCommit) {
		throw new UnsupportedOperationException("This fetcher does not support commiting offsets");
	}

	@Override
	public void seek(TopicPartition topicPartition, long offset) {
		if(partitionsToRead == null) {
			throw new IllegalArgumentException("No partitions to read set");
		}
		if(!partitionsToRead.containsKey(topicPartition)) {
			throw new IllegalArgumentException("Can not set offset on partition we are not going to read");
		}
		partitionsToRead.put(topicPartition, offset);
	}

	/*private static class FlinkLegacyConsumerConfig extends ConsumerConfig {

		public FlinkLegacyConsumerConfig(Map<?, ?> props) {
			super(props);
		}
	} */

	private static class FetchPartition {
	//	public String leaderHost;
	//	public int leaderPort;
		public int partition;
		public long offset;
	}

}
