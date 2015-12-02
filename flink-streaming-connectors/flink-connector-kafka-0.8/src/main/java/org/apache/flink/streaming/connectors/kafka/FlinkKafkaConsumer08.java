/*
 * Licensed to the Apache Software Foundation (ASF) under one or more
 * contributor license agreements.  See the NOTICE file distributed with
 * this work for additional information regarding copyright ownership.
 * The ASF licenses this file to You under the Apache License, Version 2.0
 * (the "License"); you may not use this file except in compliance with
 * the License.  You may obtain a copy of the License at
 *
 *    http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

package org.apache.flink.streaming.connectors.kafka;

import kafka.cluster.Broker;
import kafka.common.ErrorMapping;
import kafka.javaapi.PartitionMetadata;
import kafka.javaapi.TopicMetadata;
import kafka.javaapi.TopicMetadataRequest;
import kafka.javaapi.consumer.SimpleConsumer;
import org.apache.flink.streaming.util.serialization.DeserializationSchema;
import org.apache.flink.streaming.util.serialization.KeyedDeserializationSchema;
import org.apache.flink.util.NetUtils;
import org.apache.kafka.clients.consumer.ConsumerConfig;
import org.apache.kafka.common.Node;
import org.apache.kafka.common.PartitionInfo;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.net.URL;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.Properties;
import java.util.Random;

import static com.google.common.base.Preconditions.checkNotNull;

/**
 * Creates a Kafka consumer compatible with reading from Kafka 0.8.2.x brokers.
 * The consumer will internally use the old low-level Kafka API, and manually commit offsets
 * partition offsets to ZooKeeper.
 *
 * Once Kafka released the new consumer with Kafka 0.8.3 Flink might use the 0.8.3 consumer API
 * also against Kafka 0.8.2 installations.
 *
 * <p>The following additional configuration values are available:</p>
 * <ul>
 *   <li>socket.timeout.ms</li>
 *   <li>socket.receive.buffer.bytes</li>
 *   <li>fetch.message.max.bytes</li>
 *   <li>auto.offset.reset with the values "latest", "earliest" (unlike 0.8.2 behavior)</li>
 *   <li>fetch.wait.max.ms</li>
 * </ul>
 *
 * @param <T> The type of elements produced by this consumer.
 */
public class FlinkKafkaConsumer08<T> extends FlinkKafkaConsumerBase<T> {

	private static final Logger LOG = LoggerFactory.getLogger(FlinkKafkaConsumer08.class);

	private static final long serialVersionUID = -8450689820627198228L;

	/**
	 * Creates a new Kafka 0.8.2.x streaming source consumer.
	 * 
	 * @param topic
	 *           The name of the topic that should be consumed.
	 * @param valueDeserializer
	 *           The de-/serializer used to convert between Kafka's byte messages and Flink's objects. 
	 * @param props
	 *           The properties used to configure the Kafka consumer client, and the ZooKeeper client.
	 */
	public FlinkKafkaConsumer08(String topic, DeserializationSchema<T> valueDeserializer, Properties props) {
		super(topic, valueDeserializer, props, OffsetStore.FLINK_ZOOKEEPER, FetcherType.LEGACY_LOW_LEVEL);
	}

	/**
	 * Creates a new Kafka 0.8.2.x streaming source consumer.
	 *
	 * This constructor allows passing a {@see KeyedDeserializationSchema} for reading key/value
	 * pairs from Kafka.
	 *
	 * @param topic
	 *           The name of the topic that should be consumed.
	 * @param deserializer
	 *           The de-/serializer used to convert between Kafka's byte messages and Flink's objects.
	 * @param props
	 *           The properties used to configure the Kafka consumer client, and the ZooKeeper client.
	 */
	public FlinkKafkaConsumer08(String topic, KeyedDeserializationSchema<T> deserializer, Properties props) {
		super(topic, deserializer, props, OffsetStore.FLINK_ZOOKEEPER, FetcherType.LEGACY_LOW_LEVEL);
	}

	// ------------------------------------------------------------------------
	//  Kafka / ZooKeeper communication utilities
	// ------------------------------------------------------------------------


	@Override
	protected List<PartitionInfo> getPartitionsForTopic(String topic, Properties props) {
		return getPartitionsForTopicInternal(topic, props);
	}

	/**
	 * Send request to Kafka to get partitions for topic.
	 *
	 * @param topic The name of the topic.
	 * @param properties The properties for the Kafka Consumer that is used to query the partitions for the topic.
	 */
	public static List<PartitionInfo> getPartitionsForTopicInternal(final String topic, final Properties properties) {
		String seedBrokersConfString = properties.getProperty(ConsumerConfig.BOOTSTRAP_SERVERS_CONFIG);
		final int numRetries = Integer.valueOf(properties.getProperty(GET_PARTITIONS_RETRIES_KEY, Integer.toString(DEFAULT_GET_PARTITIONS_RETRIES)));

		checkNotNull(seedBrokersConfString, "Configuration property " + ConsumerConfig.BOOTSTRAP_SERVERS_CONFIG + " not set");
		String[] seedBrokers = seedBrokersConfString.split(",");
		List<PartitionInfo> partitions = new ArrayList<>();

		Random rnd = new Random();
		retryLoop: for(int retry = 0; retry < numRetries; retry++) {
			// we pick a seed broker randomly to avoid overloading the first broker with all the requests when the
			// parallel source instances start. Still, we try all available brokers.
			int index = rnd.nextInt(seedBrokers.length);
			brokersLoop: for (int arrIdx = 0; arrIdx < seedBrokers.length; arrIdx++) {
				String seedBroker = seedBrokers[index];
				LOG.info("Trying to get topic metadata from broker {} in try {}/{}", seedBroker, retry, numRetries);
				if (++index == seedBrokers.length) {
					index = 0;
				}

				URL brokerUrl = NetUtils.getCorrectHostnamePort(seedBroker);
				SimpleConsumer consumer = null;
				try {
					final String clientId = "flink-kafka-consumer-partition-lookup";
					final int soTimeout = Integer.valueOf(properties.getProperty("socket.timeout.ms", "30000"));
					final int bufferSize = Integer.valueOf(properties.getProperty("socket.receive.buffer.bytes", "65536"));
					consumer = new SimpleConsumer(brokerUrl.getHost(), brokerUrl.getPort(), soTimeout, bufferSize, clientId);

					List<String> topics = Collections.singletonList(topic);
					TopicMetadataRequest req = new TopicMetadataRequest(topics);
					kafka.javaapi.TopicMetadataResponse resp = consumer.send(req);

					List<TopicMetadata> metaData = resp.topicsMetadata();

					// clear in case we have an incomplete list from previous tries
					partitions.clear();
					for (TopicMetadata item : metaData) {
						if (item.errorCode() != ErrorMapping.NoError()) {
							if (item.errorCode() == ErrorMapping.InvalidTopicCode() || item.errorCode() == ErrorMapping.UnknownTopicOrPartitionCode()) {
								// fail hard if topic is unknown
								throw new RuntimeException("Requested partitions for unknown topic", ErrorMapping.exceptionFor(item.errorCode()));
							}
							// warn and try more brokers
							LOG.warn("Error while getting metadata from broker " + seedBroker + " to find partitions for " + topic,
									ErrorMapping.exceptionFor(item.errorCode()));
							continue brokersLoop;
						}
						if (!item.topic().equals(topic)) {
							LOG.warn("Received metadata from topic " + item.topic() + " even though it was not requested. Skipping ...");
							continue brokersLoop;
						}
						for (PartitionMetadata part : item.partitionsMetadata()) {
							Node leader = brokerToNode(part.leader());
							Node[] replicas = new Node[part.replicas().size()];
							for (int i = 0; i < part.replicas().size(); i++) {
								replicas[i] = brokerToNode(part.replicas().get(i));
							}

							Node[] ISRs = new Node[part.isr().size()];
							for (int i = 0; i < part.isr().size(); i++) {
								ISRs[i] = brokerToNode(part.isr().get(i));
							}
							PartitionInfo pInfo = new PartitionInfo(topic, part.partitionId(), leader, replicas, ISRs);
							partitions.add(pInfo);
						}
					}
					break retryLoop; // leave the loop through the brokers
				} catch (Exception e) {
					LOG.warn("Error communicating with broker " + seedBroker + " to find partitions for " + topic, e);
				} finally {
					if (consumer != null) {
						consumer.close();
					}
				}
			} // brokers loop
		} // retries loop
		return partitions;
	}

	/**
	 * Turn a broker instance into a node instance
	 * @param broker broker instance
	 * @return Node representing the given broker
	 */
	private static Node brokerToNode(Broker broker) {
		return new Node(broker.id(), broker.host(), broker.port());
	}

}
