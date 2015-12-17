package org.apache.flink.streaming.connectors.kafka;

import kafka.consumer.ConsumerConfig;
import kafka.server.KafkaServer;

import java.net.UnknownHostException;
import java.util.List;
import java.util.Properties;

/**
 * Abstract class providing a Kafka test environment
 */
public abstract class KafkaServerProvider {

	protected static final String KAFKA_HOST = "localhost";

	public abstract void prepare(int numKafkaServers);

	public abstract void shutdown();

	public abstract void deleteTestTopic(String topic);

	public abstract void createTestTopic(String topic, int numberOfPartitions, int replicationFactor);

	public abstract ConsumerConfig getStandardConsumerConfig();

	public abstract Properties getStandardProperties();

	public abstract String getVersion();

	public abstract List<KafkaServer> getBrokers();

	public abstract void restartBroker(int leaderId) throws Exception;

	public abstract LeaderInfo getLeaderToShutDown(String topic) throws UnknownHostException, Exception;

	public static class LeaderInfo {
		public String leaderConnStr;
		public int leaderId;
	}
}
