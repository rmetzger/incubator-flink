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

import org.apache.commons.collections.map.LinkedMap;

import org.apache.flink.api.common.typeinfo.TypeInformation;
import org.apache.flink.configuration.Configuration;
import org.apache.flink.streaming.api.operators.StreamingRuntimeContext;
import org.apache.flink.streaming.api.watermark.Watermark;
import org.apache.flink.streaming.connectors.kafka.internals.KafkaTopicPartition;
import org.apache.flink.streaming.util.serialization.DeserializationSchema;

import org.apache.flink.streaming.util.serialization.KeyedDeserializationSchema;
import org.apache.flink.streaming.util.serialization.KeyedDeserializationSchemaWrapper;
import org.apache.kafka.clients.consumer.ConsumerConfig;
import org.apache.kafka.clients.consumer.ConsumerRecord;
import org.apache.kafka.clients.consumer.ConsumerRecords;
import org.apache.kafka.clients.consumer.KafkaConsumer;
import org.apache.kafka.clients.consumer.OffsetAndMetadata;
import org.apache.kafka.common.PartitionInfo;
import org.apache.kafka.common.TopicPartition;
import org.apache.kafka.common.errors.WakeupException;
import org.apache.kafka.common.serialization.ByteArrayDeserializer;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.util.ArrayList;
import java.util.Collections;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Properties;

import static com.google.common.base.Preconditions.checkNotNull;

/**
 * The Flink Kafka Consumer is a streaming data source that pulls a parallel data stream from
 * Apache Kafka. The consumer can run in multiple parallel instances, each of which will pull
 * data from one or more Kafka partitions. 
 * 
 * <p>The Flink Kafka Consumer participates in checkpointing and guarantees that no data is lost
 * during a failure, and that the computation processes elements "exactly once". 
 * (Note: These guarantees naturally assume that Kafka itself does not loose any data.)</p>
 * 
 * <p>To support a variety of Kafka brokers, protocol versions, and offset committing approaches,
 * the Flink Kafka Consumer can be parametrized with a <i>fetcher</i> and an <i>offset handler</i>.</p>
 *
 * <p>Please note that Flink snapshots the offsets internally as part of its distributed checkpoints. The offsets
 * committed to Kafka / ZooKeeper are only to bring the outside view of progress in sync with Flink's view
 * of the progress. That way, monitoring and other jobs can get a view of how far the Flink Kafka consumer
 * has consumed a topic.</p>
 * 
 * <p><b>NOTE:</b> The implementation currently accesses partition metadata when the consumer
 * is constructed. That means that the client that submits the program needs to be able to
 * reach the Kafka brokers or ZooKeeper.</p>
 */
public class FlinkKafkaConsumer<T> extends FlinkKafkaConsumerBase<T> {

	// ------------------------------------------------------------------------
	
	private static final long serialVersionUID = 2324564345203409112L;
	
	private static final Logger LOG = LoggerFactory.getLogger(FlinkKafkaConsumer.class);


	/** The maximum number of pending non-committed checkpoints to track, to avoid memory leaks */
	public static final int MAX_NUM_PENDING_CHECKPOINTS = 100;

	/**
	 * Configuration key to change the polling timeout
	 */
	public static final String KEY_POLL_TIMEOUT = "flink.poll-timeout";

	public static final long DEFAULT_POLL_TIMEOUT = 100L;



	// ------  Runtime State  -------

	/** Data for pending but uncommitted checkpoints */
	private final LinkedMap pendingCheckpoints = new LinkedMap();
	private final KeyedDeserializationSchema<T> deserializer;
	private final Properties properties;
	private final List<KafkaTopicPartition> partitionInfos;

	/** The partitions actually handled by this consumer at runtime */
	private transient List<TopicPartition> subscribedPartitions;
	private transient KafkaConsumer<byte[], byte[]> consumer;
	private transient HashMap<KafkaTopicPartition, Long> offsetsState;
	private transient ConsumerThread<T> consumerThread;
	/** Exception set from the ConsumerThread */
	private transient Throwable consumerThreadException;


	private transient volatile boolean running = true;
	private transient List<KafkaTopicPartition> subscribedPartitionsAsFlink;
	private HashMap<KafkaTopicPartition, Long> restoreToOffset;


	// ------------------------------------------------------------------------


	public FlinkKafkaConsumer(String topic, DeserializationSchema<T> deserializer, Properties props) {
		this(Collections.singletonList(topic), deserializer, props);
	}

	/**
	 * Creates a new Flink Kafka Consumer, using the given type of fetcher and offset handler.
	 *
	 * <p>To determine which kink of fetcher and offset handler to use, please refer to the docs
	 * at the beginnign of this class.</p>
	 *
	 * @param topics
	 *           The Kafka topic to read from.
	 * @param deserializer
	 *           The deserializer to turn raw byte messages (without key) into Java/Scala objects.
	 * @param props
	 *           The properties that are used to configure both the fetcher and the offset handler.
	 */
	public FlinkKafkaConsumer(List<String> topics, DeserializationSchema<T> deserializer, Properties props) {
		this(topics, new KeyedDeserializationSchemaWrapper<>(deserializer),
				props);
	}

	/**
	 * Creates a new Flink Kafka Consumer, using the given type of fetcher and offset handler.
	 * 
	 * <p>To determine which kink of fetcher and offset handler to use, please refer to the docs
	 * at the beginnign of this class.</p>
	 * 
	 * @param topics
	 *           The Kafka topics to read from.
	 * @param deserializer
	 *           The deserializer to turn raw byte messages into Java/Scala objects.
	 * @param props
	 *           The properties that are used to configure both the fetcher and the offset handler.
	 */
	public FlinkKafkaConsumer(List<String> topics, KeyedDeserializationSchema<T> deserializer, Properties props) {
		super(deserializer, props);
		checkNotNull(topics, "topics");
		this.properties = checkNotNull(props, "props");
		this.deserializer = checkNotNull(deserializer, "valueDeserializer");
		setDeserializer(this.properties);
		try(KafkaConsumer<byte[], byte[]> consumer = new KafkaConsumer<>(this.properties)) {
			this.partitionInfos = new ArrayList<>();
			for (String topic : topics) {
				// get partitions for each topic
				try {
					partitionInfos.addAll(convertToFlinkKafkaTopicPartition(consumer.partitionsFor(topic)));
				} catch(NullPointerException npe) {
					// workaround for KAFKA-2880: Fetcher.getTopicMetadata NullPointerException when broker cannot be reached
					// we ignore the NPE.
				}
			}
		}
		if(partitionInfos.isEmpty()) {
			throw new RuntimeException("Unable to retrieve any partitions for the requested topics " + topics);
		}
		// we now have a list of partitions which is the same for all parallel consumer instances.

		LOG.info("Got {} partitions from these topics: {}", partitionInfos.size(), topics);
	}

	/**
	 * Converts a list of Kafka PartitionInfo's to Flink's KafkaTopicPartition (which are serializable)
	 * @param partitions A list of Kafka PartitionInfos.
	 * @return A list of KafkaTopicPartitions
	 */
	public static List<KafkaTopicPartition> convertToFlinkKafkaTopicPartition(List<PartitionInfo> partitions) {
		checkNotNull(partitions, "The given list of partitions was null");
		List<KafkaTopicPartition> ret = new ArrayList<>(partitions.size());
		for(PartitionInfo pi: partitions) {
			ret.add(new KafkaTopicPartition(pi.topic(), pi.partition()));
		}
		return ret;
	}

	public static List<TopicPartition> convertToKafkaTopicPartition(List<KafkaTopicPartition> partitions) {
		List<TopicPartition> ret = new ArrayList<>(partitions.size());
		for(KafkaTopicPartition ktp: partitions) {
			ret.add(new TopicPartition(ktp.getTopic(), ktp.getPartition()));
		}
		return ret;
	}

	// ------------------------------------------------------------------------
	//  Source life cycle
	// ------------------------------------------------------------------------

	@Override
	public void open(Configuration parameters) throws Exception {
		super.open(parameters);

		final int numConsumers = getRuntimeContext().getNumberOfParallelSubtasks();
		final int thisConsumerIndex = getRuntimeContext().getIndexOfThisSubtask();

		this.subscribedPartitionsAsFlink = assignPartitions(this.partitionInfos, numConsumers, thisConsumerIndex);
		if(this.subscribedPartitionsAsFlink.isEmpty()) {
			LOG.info("This consumer doesn't have any partitions assigned");
			this.consumer = null;
			this.running = true;
			return;
		} else {
			StreamingRuntimeContext streamingRuntimeContext = (StreamingRuntimeContext) getRuntimeContext();
			// if checkpointing is enabled, we are not automatically committing to Kafka.
			properties.setProperty(ConsumerConfig.ENABLE_AUTO_COMMIT_CONFIG, Boolean.toString(!streamingRuntimeContext.isCheckpointingEnabled()));
			this.consumer = new KafkaConsumer<>(properties);
		}

		// pick which partitions we work on
		subscribedPartitions = convertToKafkaTopicPartition(subscribedPartitionsAsFlink);

		this.consumer.assign(this.subscribedPartitions);

		if(restoreToOffset != null) {
			// we are in a recovery scenario
			for(Map.Entry<KafkaTopicPartition, Long> offset: restoreToOffset.entrySet()) {
				// seek all offsets to the right position
				this.consumer.seek(new TopicPartition(offset.getKey().getTopic(), offset.getKey().getPartition()), offset.getValue() + 1);
			}
			this.offsetsState = restoreToOffset;
		} else {
			this.offsetsState = new HashMap<>();
		}
		this.running = true;
	}


	@Override
	public void run(SourceContext<T> sourceContext) throws Exception {
		if(consumer != null) {
			consumerThread = new ConsumerThread<>(this, sourceContext);
			consumerThread.start();
			// wait for the consumer to stop
			while(consumerThread.isAlive()) {
				if(consumerThreadException != null) {
					throw new RuntimeException("ConsumerThread threw an exception", consumerThreadException);
				}
				try {
					consumerThread.join(50);
				} catch (InterruptedException ie) {
					consumerThread.shutdown();
				}
			}
			// check again for an exception
			if(consumerThreadException != null) {
				throw new RuntimeException("ConsumerThread threw an exception", consumerThreadException);
			}
		} else {
			// this source never completes, so emit a Long.MAX_VALUE watermark
			// to not block watermark forwarding
			if (getRuntimeContext().getExecutionConfig().areTimestampsEnabled()) {
				sourceContext.emitWatermark(new Watermark(Long.MAX_VALUE));
			}

			final Object waitLock = new Object();
			while (running) {
				// wait until we are canceled
				try {
					//noinspection SynchronizationOnLocalVariableOrMethodParameter
					synchronized (waitLock) {
						waitLock.wait();
					}
				}
				catch (InterruptedException e) {
					// do nothing, check our "running" status
				}
			}
		}
		// close the context after the work was done. this can actually only
		// happen when the fetcher decides to stop fetching
		sourceContext.close();
	}

	@Override
	public void cancel() {
		// set ourselves as not running
		running = false;
		if(this.consumerThread != null) {
			this.consumerThread.shutdown();
		}
	}

	@Override
	public void close() throws Exception {
		cancel();
		super.close();
	}

	@Override
	public TypeInformation<T> getProducedType() {
		return deserializer.getProducedType();
	}

	// ------------------------------------------------------------------------
	//  Checkpoint and restore
	// ------------------------------------------------------------------------

	@Override
	public HashMap<KafkaTopicPartition, Long> snapshotState(long checkpointId, long checkpointTimestamp) throws Exception {
		if (!running || this.consumer == null) {
			LOG.debug("snapshotState() called on closed source");
			return null;
		}

		if (LOG.isDebugEnabled()) {
			LOG.debug("Snapshotting state. Offsets: {}, checkpoint id: {}, timestamp: {}",
					KafkaTopicPartition.toString(offsetsState), checkpointId, checkpointTimestamp);
		}

		// the use of clone() is okay here is okay, we just need a new map, the keys are not changed
		//noinspection unchecked
		HashMap<KafkaTopicPartition, Long> currentOffsets = (HashMap<KafkaTopicPartition, Long>) offsetsState.clone();

		// the map cannot be asynchronously updated, because only one checkpoint call can happen
		// on this function at a time: either snapshotState() or notifyCheckpointComplete()
		pendingCheckpoints.put(checkpointId, currentOffsets);
			
		while (pendingCheckpoints.size() > MAX_NUM_PENDING_CHECKPOINTS) {
			pendingCheckpoints.remove(0);
		}

		return currentOffsets;
	}

	@Override
	public void restoreState(HashMap<KafkaTopicPartition, Long> restoredOffsets) {
		restoreToOffset = restoredOffsets;
	}

	@Override
	public void notifyCheckpointComplete(long checkpointId) throws Exception {
		if (!running || this.consumer == null) {
			LOG.debug("notifyCheckpointComplete() called on closed source");
			return;
		}
		
		// only one commit operation must be in progress
		if (LOG.isDebugEnabled()) {
			LOG.debug("Committing offsets externally for checkpoint {}", checkpointId);
		}

		try {
			HashMap<KafkaTopicPartition, Long> checkpointOffsets;
	
			// the map may be asynchronously updates when snapshotting state, so we synchronize
			synchronized (pendingCheckpoints) {
				final int posInMap = pendingCheckpoints.indexOf(checkpointId);
				if (posInMap == -1) {
					LOG.warn("Received confirmation for unknown checkpoint id {}", checkpointId);
					return;
				}

				//noinspection unchecked
				checkpointOffsets = (HashMap<KafkaTopicPartition, Long>) pendingCheckpoints.remove(posInMap);

				
				// remove older checkpoints in map
				for (int i = 0; i < posInMap; i++) {
					pendingCheckpoints.remove(0);
				}
			}
			if (checkpointOffsets == null || checkpointOffsets.size() == 0) {
				LOG.info("Checkpoint state was empty.");
				return;
			}
			Map<TopicPartition, OffsetAndMetadata> kafkaCheckpointOffsets = convertToCommitMap(checkpointOffsets);
			synchronized (this.consumer) {
				this.consumer.commitSync(kafkaCheckpointOffsets);
			}
		}
		catch (Exception e) {
			if (running) {
				throw e;
			}
			// else ignore exception if we are no longer running
		}
	}

	public static Map<TopicPartition, OffsetAndMetadata> convertToCommitMap(HashMap<KafkaTopicPartition, Long> checkpointOffsets) {
		Map<TopicPartition, OffsetAndMetadata> ret = new HashMap<>(checkpointOffsets.size());
		for(Map.Entry<KafkaTopicPartition, Long> partitionOffset: checkpointOffsets.entrySet()) {
			ret.put(new TopicPartition(partitionOffset.getKey().getTopic(), partitionOffset.getKey().getPartition()),
					new OffsetAndMetadata(partitionOffset.getValue(), ""));
		}
		return ret;
	}

	// ------------------------------------------------------------------------
	//  Miscellaneous utilities 
	// ------------------------------------------------------------------------


	protected static void setDeserializer(Properties props) {
		if (!props.contains(ConsumerConfig.KEY_DESERIALIZER_CLASS_CONFIG)) {
			props.put(ConsumerConfig.KEY_DESERIALIZER_CLASS_CONFIG, ByteArrayDeserializer.class.getCanonicalName());
		} else {
			LOG.warn("Overwriting the '{}' is not recommended", ConsumerConfig.KEY_DESERIALIZER_CLASS_CONFIG);
		}

		if (!props.contains(ConsumerConfig.VALUE_DESERIALIZER_CLASS_CONFIG)) {
			props.put(ConsumerConfig.VALUE_DESERIALIZER_CLASS_CONFIG, ByteArrayDeserializer.class.getCanonicalName());
		} else {
			LOG.warn("Overwriting the '{}' is not recommended", ConsumerConfig.VALUE_DESERIALIZER_CLASS_CONFIG);
		}
	}

	/**
	 * We use a separate thread for executing the KafkaConsumer.poll(timeout) call because Kafka is not
	 * handling interrups properly. On an interrupt (which happens automatically by Flink if the task
	 * doesn't react to cancel() calls), the poll() method might never return.
	 * On cancel, we'll wakeup the .poll() call and wait for it to return
	 */
	private static class ConsumerThread<T> extends Thread {
		private final FlinkKafkaConsumer<T> flinkKafkaConsumer;
		private final SourceContext<T> sourceContext;
		private boolean running = true;

		public ConsumerThread(FlinkKafkaConsumer<T> flinkKafkaConsumer, SourceContext<T> sourceContext) {
			this.flinkKafkaConsumer = flinkKafkaConsumer;
			this.sourceContext = sourceContext;
		}

		@Override
		public void run() {
			try {
				long pollTimeout = Long.parseLong(flinkKafkaConsumer.properties.getProperty(KEY_POLL_TIMEOUT, Long.toString(DEFAULT_POLL_TIMEOUT)));
				while (running) {
					ConsumerRecords<byte[], byte[]> records;
					//noinspection SynchronizeOnNonFinalField
					synchronized (flinkKafkaConsumer.consumer) {
						try {
							records = flinkKafkaConsumer.consumer.poll(pollTimeout);
						} catch (WakeupException we) {
							if (running) {
								throw we;
							}
							// leave loop
							continue;
						}
					}
					// get the records for each topic partition
					for (int i = 0; i < flinkKafkaConsumer.subscribedPartitions.size(); i++) {
						TopicPartition partition = flinkKafkaConsumer.subscribedPartitions.get(i);
						KafkaTopicPartition flinkPartition = flinkKafkaConsumer.subscribedPartitionsAsFlink.get(i);
						List<ConsumerRecord<byte[], byte[]>> partitionRecords = records.records(partition);
						//noinspection ForLoopReplaceableByForEach
						for (int j = 0; j < partitionRecords.size(); j++) {
							ConsumerRecord<byte[], byte[]> record = partitionRecords.get(j);
							T value = flinkKafkaConsumer.deserializer.deserialize(record.key(), record.value(), record.topic(), record.offset());
							synchronized (sourceContext.getCheckpointLock()) {
								sourceContext.collect(value);
								flinkKafkaConsumer.offsetsState.put(flinkPartition, record.offset());
							}
						}
					}
				}
			} catch(Throwable t) {
				if(running) {
					this.flinkKafkaConsumer.stopWithError(t);
				} else {
					LOG.debug("Stopped ConsumerThread threw exception", t);
				}
			}
		}

		/**
		 * Try to shutdown the thread
		 */
		public void shutdown() {
			this.running = false;
			this.flinkKafkaConsumer.consumer.wakeup();
		}
	}

	private void stopWithError(Throwable t) {
		this.consumerThreadException = t;
	}
}
