/*
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

package org.apache.flink.streaming.connectors.kafka;

import org.apache.flink.streaming.connectors.kafka.partitioner.KafkaPartitioner;
import org.apache.flink.streaming.util.serialization.DeserializationSchema;
import org.apache.flink.streaming.util.serialization.KeyedDeserializationSchema;
import org.apache.flink.streaming.util.serialization.SerializationSchema;

import org.junit.Test;

import java.util.List;
import java.util.Properties;

@SuppressWarnings("serial")
public class Kafka08ProducerITCase extends KafkaProducerTestBase {


	@Test
	public void testCustomPartitioning() {
		runCustomPartitioningTest();
	}

	@Override
	protected <T> FlinkKafkaConsumer<T> getConsumer(List<String> topics, DeserializationSchema<T> deserializationSchema, Properties props) {
		return new FlinkKafkaConsumer082<>(topics, deserializationSchema, props);
	}

	@Override
	protected <T> FlinkKafkaConsumerBase<T> getConsumer(List<String> topics, KeyedDeserializationSchema<T> readSchema, Properties props) {
		return new FlinkKafkaConsumer082<>(topics, readSchema, props);
	}

	@Override
	protected <T> FlinkKafkaConsumerBase<T> getConsumer(String topic, KeyedDeserializationSchema<T> readSchema, Properties props) {
		return new FlinkKafkaConsumer082<>(topic, readSchema, props);
	}

	@Override
	protected <T> FlinkKafkaProducerBase<T> getProducer(String topic, SerializationSchema<T> serSchema, Properties props, KafkaPartitioner partitioner) {
		return new FlinkKafkaProducer<T>(topic, serSchema, props, partitioner);
	}
}
