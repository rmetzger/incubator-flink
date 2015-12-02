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

import com.google.common.net.HostAndPort;
import kafka.admin.AdminUtils;
import kafka.api.PartitionMetadata;
import kafka.cluster.Broker;
import kafka.network.SocketServer;
import kafka.server.KafkaConfig;
import kafka.server.KafkaServer;
import org.I0Itec.zkclient.ZkClient;
import org.apache.flink.api.java.tuple.Tuple2;
import org.apache.flink.streaming.connectors.kafka.internals.ZooKeeperStringSerializer;
import org.apache.flink.streaming.util.serialization.DeserializationSchema;

import org.apache.flink.streaming.util.serialization.KeyedDeserializationSchema;
import org.apache.flink.streaming.util.serialization.SimpleStringSchema;
import org.junit.Test;
import scala.collection.Seq;

import java.util.List;
import java.util.Properties;

import static org.junit.Assert.fail;


public class KafkaITCase extends KafkaConsumerTestBase {
	
	@Override
	protected <T> FlinkKafkaConsumerBase<T> getConsumer(String topic, DeserializationSchema<T> deserializationSchema, Properties props) {
		return new FlinkKafkaConsumer08<>(topic, deserializationSchema, props);
	}

	@Override
	protected <T> FlinkKafkaConsumerBase<T> getConsumer(String topic, KeyedDeserializationSchema<T> deserializationSchema, Properties props) {
		return new FlinkKafkaConsumer08<>(topic, deserializationSchema, props);
	}



	// ------------------------------------------------------------------------
	//  Required methods to implement
	// ------------------------------------------------------------------------

	@Override
	protected HostAndPort getHostPort(SocketServer socketServer) {
		return HostAndPort.fromParts(socketServer.host(), socketServer.port());
	}

	@Override
	KafkaServer createKafkaServer(KafkaConfig kafkaConfig) {
		return new KafkaServer(kafkaConfig, new KafkaLocalSystemTime());
	}

	@Override
	protected Tuple2<Integer, String> getLeader(String topic) throws Exception {
		ZkClient zkClient = createZookeeperClient();
		PartitionMetadata firstPart = null;
		do {
			if (firstPart != null) {
				LOG.info("Unable to find leader. error code {}", firstPart.errorCode());
				// not the first try. Sleep a bit
				Thread.sleep(150);
			}

			Seq<PartitionMetadata> partitionMetadata = AdminUtils.fetchTopicMetadataFromZk(topic, zkClient).partitionsMetadata();
			firstPart = partitionMetadata.head();
		}
		while (firstPart.errorCode() != 0);
		zkClient.close();
		Broker leader = firstPart.leader().get();
		return new Tuple2<>(leader.id(), leader.host() + ":" + leader.port());
	}


	@Override
	void createTestTopic(String topic, int numberOfPartitions, int replicationFactor) {
		// create topic with one client
		Properties topicConfig = new Properties();
		LOG.info("Creating topic {}", topic);

		ZkClient creator = new ZkClient(standardCC.zkConnect(), standardCC.zkSessionTimeoutMs(),
				standardCC.zkConnectionTimeoutMs(), new ZooKeeperStringSerializer());

		AdminUtils.createTopic(creator, topic, numberOfPartitions, replicationFactor, topicConfig);
		creator.close();

		// validate that the topic has been created
		final long deadline = System.currentTimeMillis() + 30000;
		do {
			try {
				Thread.sleep(100);
			}
			catch (InterruptedException e) {
				// restore interrupted state
			}
			FlinkKafkaConsumerBase consumer = getConsumer(topic, new SimpleStringSchema(), standardProps);

			List partitions = consumer.getPartitionsForTopic(topic, standardProps);
			if (partitions != null && partitions.size() > 0) {
				return;
			}
		}
		while (System.currentTimeMillis() < deadline);
		fail ("Test topic could not be created");
	}

	@Override
	void deleteTestTopic(String topic) {
		LOG.info("Deleting topic {}", topic);

		ZkClient zk = new ZkClient(standardCC.zkConnect(), standardCC.zkSessionTimeoutMs(),
				standardCC.zkConnectionTimeoutMs(), new ZooKeeperStringSerializer());

		AdminUtils.deleteTopic(zk, topic);

		zk.close();
	}

	
	// ------------------------------------------------------------------------
	//  Suite of Tests
	// ------------------------------------------------------------------------
	
	@Test
	public void testCheckpointing() throws Exception {
		runCheckpointingTest();
	}

	@Test()
	public void testFailOnNoBroker() throws Exception {
		runFailOnNoBrokerTest();
	}

	@Test
	public void testOffsetInZookeeper() throws Exception {
		runOffsetInZookeeperValidationTest();
	}

	@Test
	public void testOffsetAutocommitTest() throws Exception {
		runOffsetAutocommitTest();
	}


	@Test
	public void testConcurrentProducerConsumerTopology() throws Exception {
		runSimpleConcurrentProducerConsumerTopology();
	}

	@Test(timeout = 60000)
	public void testKeyValueSupport() throws Exception {
		runKeyValueTest();
	}

	// --- canceling / failures ---
	
	@Test
	public void testCancelingEmptyTopic() throws Exception {
		runCancelingOnEmptyInputTest();
	}

	@Test
	public void testCancelingFullTopic() throws Exception {
		runCancelingOnFullInputTest();
	}

	@Test
	public void testFailOnDeploy() throws Exception {
		runFailOnDeployTest();
	}

	@Test
	public void testInvalidOffset() throws Exception {
		runInvalidOffsetTest();
	}

	// --- source to partition mappings and exactly once ---
	
	@Test
	public void testOneToOneSources() throws Exception {
		runOneToOneExactlyOnceTest();
	}

	@Test
	public void testOneSourceMultiplePartitions() throws Exception {
		runOneSourceMultiplePartitionsExactlyOnceTest();
	}

	@Test
	public void testMultipleSourcesOnePartition() throws Exception {
		runMultipleSourcesOnePartitionExactlyOnceTest();
	}

	// --- broker failure ---

	@Test
	public void testBrokerFailure() throws Exception {
		runBrokerFailureTest();
	}

	// --- special executions ---
	
	@Test
	public void testBigRecordJob() throws Exception {
		runBigRecordTestTopology();
	}


}
