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

import org.apache.flink.api.java.typeutils.GenericTypeInfo;
import org.apache.flink.streaming.api.datastream.DataStream;
import org.apache.flink.streaming.api.operators.OneInputStreamOperator;
import org.apache.flink.streaming.api.operators.StreamSink;
import org.apache.flink.streaming.connectors.kafka.partitioner.FixedPartitioner;
import org.apache.flink.streaming.connectors.kafka.partitioner.KafkaPartitioner;
import org.apache.flink.streaming.runtime.streamrecord.StreamRecord;
import org.apache.flink.streaming.util.serialization.KeyedSerializationSchema;
import org.apache.flink.streaming.util.serialization.KeyedSerializationSchemaWrapper;
import org.apache.flink.streaming.util.serialization.SerializationSchema;
import org.apache.kafka.clients.producer.ProducerRecord;

import java.util.Properties;

import static org.apache.flink.streaming.connectors.kafka.FlinkKafkaProducerBase.getPropertiesFromBrokerList;


/**
 * Flink Sink to produce data into a Kafka topic. This producer is compatible with Kafka 0.10.x
 */
public class FlinkKafkaProducer010<T> extends StreamSink<T> {

	/**
	 * Creates a FlinkKafkaProducer for a given topic. The sink produces a DataStream to
	 * the topic.
	 *
	 * @param inStream The stream to write to Kafka
	 * @param topicId ID of the Kafka topic.
	 * @param serializationSchema User defined serialization schema supporting key/value messages
	 * @param producerConfig Properties with the producer configuration.
	 */
	public static <T> void writeToKafka(DataStream<T> inStream,
										String topicId,
										KeyedSerializationSchema<T> serializationSchema,
										Properties producerConfig) {
		writeToKafka(inStream, topicId, serializationSchema, producerConfig, new FixedPartitioner<T>());
	}


	/**
	 * Creates a FlinkKafkaProducer for a given topic. the sink produces a DataStream to
	 * the topic.
	 *
	 * @param inStream The stream to write to Kafka
	 * @param topicId ID of the Kafka topic.
	 * @param serializationSchema User defined (keyless) serialization schema.
	 * @param producerConfig Properties with the producer configuration.
	 */
	public static <T> void writeToKafka(DataStream<T> inStream,
										String topicId,
										SerializationSchema<T> serializationSchema,
										Properties producerConfig) {
		writeToKafka(inStream, topicId, new KeyedSerializationSchemaWrapper<>(serializationSchema), producerConfig, new FixedPartitioner<T>());
	}

	/**
	 * Creates a FlinkKafkaProducer for a given topic. The sink produces a DataStream to
	 * the topic.
	 *
	 * @param inStream The stream to write to Kafka
	 * @param topicId The name of the target topic
	 * @param serializationSchema A serializable serialization schema for turning user objects into a kafka-consumable byte[] supporting key/value messages
	 * @param producerConfig Configuration properties for the KafkaProducer. 'bootstrap.servers.' is the only required argument.
	 * @param customPartitioner A serializable partitioner for assigning messages to Kafka partitions.
	 */
	public static <T> void writeToKafka(DataStream<T> inStream,
										String topicId,
										KeyedSerializationSchema<T> serializationSchema,
										Properties producerConfig,
										KafkaPartitioner<T> customPartitioner) {
		GenericTypeInfo<Object> objectTypeInfo = new GenericTypeInfo<>(Object.class);
		FlinkKafkaProducer010<T> kafkaProducer = new FlinkKafkaProducer010<>(topicId, serializationSchema, producerConfig, customPartitioner);
		inStream.transform("FlinKafkaProducer 0.10.x", objectTypeInfo, kafkaProducer);
	}

	/**
	 * Internal Kafka producer, allowing us to get access to the event timestamp.
	 * @param <IN>
	 */
	private static class InternalKafka010Producer<IN> extends FlinkKafkaProducer09<IN> {

		public InternalKafka010Producer(String topicId, KeyedSerializationSchema<IN> serializationSchema, Properties producerConfig, KafkaPartitioner<IN> customPartitioner) {
			super(topicId, serializationSchema, producerConfig, customPartitioner);
		}
	}


	/**
	 * Create internal Kafka producer, and pass it as a UDF to the StreamSink.
	 *
	 */
	private FlinkKafkaProducer010(String topicId, KeyedSerializationSchema<T> serializationSchema, Properties producerConfig, KafkaPartitioner<T> customPartitioner) {
		super(new InternalKafka010Producer<>(topicId, serializationSchema, producerConfig, customPartitioner));
	}

	/**
	 * This method contains the timestamp specific operations
	 */
	@Override
	public void processElement(StreamRecord<T> element) throws Exception {
		// usually, we would call: userFunction.invoke(element.getValue());

		final InternalKafka010Producer<T> internalProducer = (InternalKafka010Producer<T>) userFunction;
		final T next = element.getValue();

		internalProducer.checkErroneous();

		byte[] serializedKey = internalProducer.schema.serializeKey(next);
		byte[] serializedValue = internalProducer.schema.serializeValue(next);
		String targetTopic = internalProducer.schema.getTargetTopic(next);
		if (targetTopic == null) {
			targetTopic = internalProducer.defaultTopicId;
		}

		Long timestamp = null;
		// TODO Make this configurable.
		if(true) {
			timestamp = element.getTimestamp();
		}
		ProducerRecord<byte[], byte[]> record;
		if (internalProducer.partitioner == null) {
			record = new ProducerRecord<>(targetTopic, null, timestamp, serializedKey, serializedValue);
		} else {
			record = new ProducerRecord<>(targetTopic, internalProducer.partitioner.partition(next, serializedKey, serializedValue, internalProducer.partitions.length), timestamp, serializedKey, serializedValue);
		}
		if (internalProducer.flushOnCheckpoint) {
			synchronized (internalProducer.pendingRecordsLock) {
				internalProducer.pendingRecords++;
			}
		}
		internalProducer.producer.send(record, internalProducer.callback);
	}
	
}
