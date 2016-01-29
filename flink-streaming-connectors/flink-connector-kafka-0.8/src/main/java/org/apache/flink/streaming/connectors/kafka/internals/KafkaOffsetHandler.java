package org.apache.flink.streaming.connectors.kafka.internals;

import kafka.api.ConsumerMetadataRequest;
import kafka.common.OffsetMetadataAndError;
import kafka.javaapi.OffsetCommitRequest;
import kafka.cluster.Broker;
import kafka.common.ErrorMapping;
import kafka.common.OffsetAndMetadata;
import kafka.common.TopicAndPartition;
import kafka.javaapi.ConsumerMetadataResponse;
import kafka.javaapi.OffsetCommitResponse;
import kafka.javaapi.OffsetFetchRequest;
import kafka.javaapi.OffsetFetchResponse;
import kafka.network.BlockingChannel;
import org.apache.flink.streaming.connectors.kafka.FlinkKafkaConsumer08;
import org.apache.flink.util.NetUtils;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.io.IOException;
import java.net.URL;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Properties;

import static com.google.common.base.Preconditions.checkNotNull;

/**
 * The KafkaOffsetHandler is maintaining a connection to the broker which is the "offset manager" for
 * a consumer group.
 *
 * The implementation is based on https://cwiki.apache.org/confluence/display/KAFKA/Committing+and+fetching+consumer+offsets+in+Kafka
 */
public class KafkaOffsetHandler implements OffsetHandler {

	private static final Logger LOG = LoggerFactory.getLogger(KafkaOffsetHandler.class);

	private final Properties properties;
	private final int offsetChannelTimeoutMs;
	private final String groupId;
	private final String clientId;
	private final long offsetChannelBackoffMs;
	private final int discoveryRetryCount;
	private final boolean ignoreErrors;
	private final int commitRetryCount;
	private final int fetchRetryCount;
	private final String offsetStorageString;
	/**
	 * (See Kafka protocol):
	 * protocolVersion=0: commit offset to Zookeeper
	 * protocolVersion=1: commit offset to Kafka
	 */
	private short protocolVersion = kafka.api.OffsetCommitRequest.CurrentVersion();
	private BlockingChannel offsetManagerChannel = null;

	public KafkaOffsetHandler(Properties properties) {
		this.properties = properties;
		// set protocol version
		this.offsetStorageString = properties.getProperty("offsets.storage", "zookeeper");
		switch(offsetStorageString) {
			case "zookeeper":
				protocolVersion = 0;
				break;
			case "kafka":
				protocolVersion = 1;
				break;
			default:
				protocolVersion = kafka.api.OffsetCommitRequest.CurrentVersion();
				break;
		}
		this.offsetChannelTimeoutMs = Integer.parseInt(properties.getProperty("offsets.channel.socket.timeout.ms", "10000"));
		this.offsetChannelBackoffMs = Long.parseLong(properties.getProperty("offsets.channel.backoff.ms", "1000"));
		this.groupId = properties.getProperty("group.id", "flink-kafka-consumer-0.8");
		this.clientId = properties.getProperty("client.id", "flink-kafka-consumer-offset-mgr");
		// when enabling this, flink will try to connect on each offset commit!
		this.ignoreErrors = Boolean.parseBoolean(properties.getProperty("flink.kafka-offset-handler.ignore-errors", "false"));
		this.commitRetryCount = Integer.parseInt(properties.getProperty("offsets.commit.max.retries", "5"));
		this.discoveryRetryCount = Integer.parseInt(properties.getProperty("flink.kafka-offset-handler.discovery-retry-count", "2"));
		this.fetchRetryCount = Integer.parseInt(properties.getProperty("flink.kafka-offset-handler.fetch-retry-count", "2"));
	}

	/**
	 * Takes care of offset manager discovery
	 */
	private void discoverOffsetManager() throws Exception {
		if(offsetManagerChannel == null) {
			// start channel manager discovery: ask any broker
			String seedBrokersConfString = properties.getProperty(org.apache.kafka.clients.consumer.ConsumerConfig.BOOTSTRAP_SERVERS_CONFIG);
			checkNotNull(seedBrokersConfString, "Configuration property " + org.apache.kafka.clients.consumer.ConsumerConfig.BOOTSTRAP_SERVERS_CONFIG + " not set");
			String[] seedBrokers = seedBrokersConfString.split(",");
			for(int retry = 0; retry < discoveryRetryCount; retry++) {
				for (int i = 0; i < seedBrokers.length; i++) {
					try {
						String brokerString = seedBrokers[i];
						URL brokerUrl = NetUtils.getCorrectHostnamePort(brokerString);
						LOG.info("Connecting to broker {} for requesting the consumer metadata", brokerString);
						offsetManagerChannel = new BlockingChannel(brokerUrl.getHost(), brokerUrl.getPort(),
								BlockingChannel.UseDefaultBufferSize(),
								BlockingChannel.UseDefaultBufferSize(),
								offsetChannelTimeoutMs);
						offsetManagerChannel.connect();
						// try getting consumer metadata
						offsetManagerChannel.send(new ConsumerMetadataRequest(groupId, ConsumerMetadataRequest.CurrentVersion(), 0, clientId));
						ConsumerMetadataResponse metadataResponse = ConsumerMetadataResponse.readFrom(offsetManagerChannel.receive().buffer());

						if (metadataResponse.errorCode() == ErrorMapping.NoError()) {
							Broker offsetManager = metadataResponse.coordinator();
							// if the coordinator is different, from the above channel's host then reconnect
							if (!offsetManager.host().equals(brokerUrl.getHost()) || offsetManager.port() != brokerUrl.getPort()) {
								LOG.info("Connecting to offsetManager for consumer group '{}': {}:{}", groupId, offsetManager.host(), offsetManager.port());
								offsetManagerChannel.disconnect();
								offsetManagerChannel = new BlockingChannel(offsetManager.host(), offsetManager.port(),
										BlockingChannel.UseDefaultBufferSize(),
										BlockingChannel.UseDefaultBufferSize(),
										offsetChannelTimeoutMs);
								offsetManagerChannel.connect();
								return; // offsetManagerChannel is available.
							}
						} else {
							Throwable error = ErrorMapping.exceptionFor(metadataResponse.errorCode());
							LOG.warn("Metadata response from broker {} contained error {}: {}", brokerString, error.getClass().getCanonicalName(), error.getMessage());
							LOG.debug("Exception", error);
							// wait backoff time:
							Thread.sleep(offsetChannelBackoffMs);
						}
					} catch (Exception e) {
						// error while trying to connect to offset manager
						// wait backoff time:
						Thread.sleep(offsetChannelBackoffMs);
						LOG.warn("Error while trying to find offset manager for consumer group '{}'", groupId, e);
					}
				}
				LOG.info("Retrying to connect to offset manager: {}/{}", retry, discoveryRetryCount);
			}
			// offset manager is still null
			if(offsetManagerChannel == null) {
				String error = "Unable to determine the offset manager. Please check previous log entries";
				if(ignoreErrors) {
					LOG.warn(error);
				} else {
					throw new RuntimeException(error);
				}
			}
		}
	}

	@Override
	public void commit(Map<KafkaTopicPartition, Long> offsetsToCommit) throws Exception {
		discoverOffsetManager();
		if(offsetManagerChannel != null) {
			// convert offsets Map into Kafka representation & build request
			long now = System.currentTimeMillis();
			Map<TopicAndPartition, OffsetAndMetadata> offsetsAsKafka = new HashMap<>();
			for(Map.Entry<KafkaTopicPartition, Long> offsetToCommit: offsetsToCommit.entrySet()) {
				TopicAndPartition ktp = new TopicAndPartition(offsetToCommit.getKey().getTopic(), offsetToCommit.getKey().getPartition());
				offsetsAsKafka.put(ktp, new OffsetAndMetadata(offsetToCommit.getValue(), OffsetAndMetadata.NoMetadata(), now));
			}
			OffsetCommitRequest commitRequest = new OffsetCommitRequest(groupId, offsetsAsKafka, 0, clientId, protocolVersion);
			for(int retry = 0; retry < commitRetryCount; retry++) {
				offsetManagerChannel.send(commitRequest.underlying());
				OffsetCommitResponse commitResponse = OffsetCommitResponse.readFrom(offsetManagerChannel.receive().buffer());
				if (commitResponse.hasError()) {
					for (Object partitionErrorCode: commitResponse.errors().values()) {
						if ((short)partitionErrorCode == ErrorMapping.OffsetMetadataTooLargeCode()) {
							throw new RuntimeException("Offset metadata too large"); // can not happen bc metadata is empty
						} else if ((short)partitionErrorCode == ErrorMapping.NotCoordinatorForConsumerCode() || (short)partitionErrorCode == ErrorMapping.ConsumerCoordinatorNotAvailableCode()) {
							LOG.warn("Unable to commit offset because offset manager has moved.");
							offsetManagerChannel.disconnect();
							offsetManagerChannel = null;
							discoverOffsetManager();
							break; // leave error code loop
						} else {
							// log and retry the commit
							LOG.warn("Unable to commit offset. Error:", ErrorMapping.exceptionFor((short)partitionErrorCode));
						}
					}
				} else {
					return; // no error.
				}
				LOG.info("Retrying to commit offset {}/{}", retry, commitRetryCount);
			}

			String error = "Unable to commit offsets. Please check previous log entries";
			if(ignoreErrors) {
				LOG.warn(error);
			} else {
				throw new RuntimeException(error);
			}
		}
	}

	@Override
	public void seekFetcherToInitialOffsets(List<KafkaTopicPartitionLeader> partitions, Fetcher fetcher) throws Exception {
		discoverOffsetManager();
		if(offsetManagerChannel != null) {
			List<TopicAndPartition> kafkaPartitions = new ArrayList<>(partitions.size());
			for(KafkaTopicPartitionLeader ktp: partitions) {
				kafkaPartitions.add(new TopicAndPartition(ktp.getTopicPartition().getTopic(), ktp.getTopicPartition().getPartition()));
			}
			OffsetFetchRequest fetchRequest = new OffsetFetchRequest(groupId, kafkaPartitions, protocolVersion, 0, clientId);
			Map<KafkaTopicPartition, Long> seekOffsets = new HashMap<>();

			retry: for(int retry = 0; retry < fetchRetryCount; retry++) {
				offsetManagerChannel.send(fetchRequest.underlying());
				OffsetFetchResponse fetchResponse = OffsetFetchResponse.readFrom(offsetManagerChannel.receive().buffer());
				Map<TopicAndPartition, OffsetMetadataAndError> kafkaOffsetsResult = fetchResponse.offsets();

				for (Map.Entry<TopicAndPartition, OffsetMetadataAndError> kafkaOffset : kafkaOffsetsResult.entrySet()) {
					OffsetMetadataAndError ome = kafkaOffset.getValue();
					if (ome.error() == ErrorMapping.NoError()) {
						long offset = ome.offset();
						if (offset != FlinkKafkaConsumer08.OFFSET_NOT_SET) {
							// the offset in Zookeeper was the last read offset, seek is accepting the next-to-read-offset.
							KafkaTopicPartition tkp = new KafkaTopicPartition(kafkaOffset.getKey().topic(), kafkaOffset.getKey().partition());
							seekOffsets.put(tkp, offset + 1);
						}
					} else {
						if (ome.error() == ErrorMapping.NotCoordinatorForConsumerCode()) {
							LOG.warn("Unable to fetch offset because offset manager has moved.");
							offsetManagerChannel.disconnect();
							offsetManagerChannel = null;
							discoverOffsetManager();
						} else if(ome.error() == ErrorMapping.OffsetsLoadInProgressCode()) {
							LOG.warn("Unable to fetch offset because offsets load in progress.");
							Thread.sleep(offsetChannelBackoffMs);
						} else if(ome.error() == ErrorMapping.UnknownTopicOrPartitionCode()) {
							LOG.info("No offset known for: {}", kafkaOffset.getKey());
						} else {
							LOG.warn("Unknown error while fetching offsets", ErrorMapping.exceptionFor(ome.error()));
						}
						continue retry; // retry
					}
				}
			}

			// seek
			for (Map.Entry<KafkaTopicPartition, Long> seekOffset : seekOffsets.entrySet()) {
				KafkaTopicPartition partition = seekOffset.getKey();
				LOG.info("Offset for partition {} was set to {} in {}. Seeking fetcher to that position.",
						partition, seekOffset.getValue(), offsetStorageString);
				fetcher.seek(partition, seekOffset.getValue());
			}
		}
	}

	@Override
	public void close() throws IOException {
		if(offsetManagerChannel != null) {
			offsetManagerChannel.disconnect();
			offsetManagerChannel = null;
		}
	}
}
