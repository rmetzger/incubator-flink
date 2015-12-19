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
import org.apache.flink.api.java.typeutils.ResultTypeQueryable;
import org.apache.flink.streaming.api.checkpoint.CheckpointNotifier;
import org.apache.flink.streaming.api.checkpoint.CheckpointedAsynchronously;
import org.apache.flink.streaming.api.functions.source.RichParallelSourceFunction;
import org.apache.flink.streaming.connectors.kafka.internals.KafkaTopicPartition;
import org.apache.flink.streaming.util.serialization.KeyedDeserializationSchema;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Properties;

import static com.google.common.base.Preconditions.checkArgument;
import static com.google.common.base.Preconditions.checkNotNull;


public abstract class FlinkKafkaConsumerBase<T> extends RichParallelSourceFunction<T>
		implements CheckpointNotifier, CheckpointedAsynchronously<HashMap<KafkaTopicPartition, Long>>, ResultTypeQueryable<T> {



	// ------------------------------------------------------------------------

	private static final long serialVersionUID = -6272159445203409112L;

	/** The maximum number of pending non-committed checkpoints to track, to avoid memory leaks */
	public static final int MAX_NUM_PENDING_CHECKPOINTS = 100;



	/** The schema to convert between Kafka#s byte messages, and Flink's objects */
	protected final KeyedDeserializationSchema<T> deserializer;


	// ------  Runtime State  -------

	/** Data for pending but uncommitted checkpoints */
	protected final LinkedMap pendingCheckpoints = new LinkedMap();


	/** The offsets of the last returned elements */
	protected transient HashMap<KafkaTopicPartition, Long> lastOffsets;

	/** The offsets to restore to, if the consumer restores state from a checkpoint */
	protected transient HashMap<KafkaTopicPartition, Long> restoreToOffset;

	// ------------------------------------------------------------------------


	/**
	 * Creates a new Flink Kafka Consumer, using the given type of fetcher and offset handler.
	 *
	 * <p>To determine which kink of fetcher and offset handler to use, please refer to the docs
	 * at the beginnign of this class.</p>
	 *
	 * @param deserializer
	 *           The deserializer to turn raw byte messages into Java/Scala objects.
	 * @param props
	 *           The properties that are used to configure both the fetcher and the offset handler.
	 */
	public FlinkKafkaConsumerBase(KeyedDeserializationSchema<T> deserializer, Properties props) {

		this.deserializer = checkNotNull(deserializer, "valueDeserializer");


		/*if (LOG.isInfoEnabled()) {
			Map<String, Integer> countPerTopic = new HashMap<>();
			for (KafkaTopicPartitionLeader partition : partitionInfos) {
				Integer count = countPerTopic.get(partition.getTopicPartition().getTopic());
				if (count == null) {
					count = 1;
				} else {
					count++;
				}
				countPerTopic.put(partition.getTopicPartition().getTopic(), count);
			}
			StringBuilder sb = new StringBuilder();
			for (Map.Entry<String, Integer> e : countPerTopic.entrySet()) {
				sb.append(e.getKey()).append(" (").append(e.getValue()).append("), ");
			}
			LOG.info("Consumer is going to read the following topics (with number of partitions): ", sb.toString());
		} */
	}

	// ------------------------------------------------------------------------
	//  Source life cycle
	// ------------------------------------------------------------------------
/*
	@Override
	public void open(Configuration parameters) throws Exception {
		super.open(parameters);
		
		final int numConsumers = getRuntimeContext().getNumberOfParallelSubtasks();
		final int thisConsumerIndex = getRuntimeContext().getIndexOfThisSubtask();
		
		// pick which partitions we work on
		subscribedPartitions = assignPartitions(this.partitionInfos, numConsumers, thisConsumerIndex);
		
		if (LOG.isInfoEnabled()) {
			LOG.info("Kafka consumer {} will read partitions {} out of partitions {}",
					thisConsumerIndex, KafkaTopicPartitionLeader.toString(subscribedPartitions), this.partitionInfos.size());
		}

		// we leave the fetcher as null, if we have no partitions
		if (subscribedPartitions.isEmpty()) {
			LOG.info("Kafka consumer {} has no partitions (empty source)", thisConsumerIndex);
			this.fetcher = null; // fetcher remains null
			return;
		}
		
		// create fetcher
		switch (fetcherType){
			case NEW_HIGH_LEVEL:
				throw new UnsupportedOperationException("Currently unsupported");
			case LEGACY_LOW_LEVEL:
				fetcher = new LegacyFetcher(this.subscribedPartitions, props, getRuntimeContext().getTaskName());
				break;
			default:
				throw new RuntimeException("Requested unknown fetcher " + fetcher);
		}

		// offset handling
		switch (offsetStore){
			case FLINK_ZOOKEEPER:
				offsetHandler = new ZookeeperOffsetHandler(props);
				break;
			case KAFKA:
				throw new Exception("Kafka offset handler cannot work with legacy fetcher");
			default:
				throw new RuntimeException("Requested unknown offset store " + offsetStore);
		}
		
		committedOffsets = new HashMap<>();

		// seek to last known pos, from restore request
		if (restoreToOffset != null) {
			if (LOG.isInfoEnabled()) {
				LOG.info("Consumer {} is restored from previous checkpoint: {}",
						thisConsumerIndex, KafkaTopicPartition.toString(restoreToOffset));
			}
			
			for (Map.Entry<KafkaTopicPartition, Long> restorePartition: restoreToOffset.entrySet()) {
				// seek fetcher to restore position
				// we set the offset +1 here, because seek() is accepting the next offset to read,
				// but the restore offset is the last read offset
				fetcher.seek(restorePartition.getKey(), restorePartition.getValue() + 1);
			}
			// initialize offsets with restored state
			this.lastOffsets = restoreToOffset;
			restoreToOffset = null;
		}
		else {
			// start with empty offsets
			lastOffsets = new HashMap<>();

			// no restore request. Let the offset handler take care of the initial offset seeking
			offsetHandler.seekFetcherToInitialOffsets(subscribedPartitions, fetcher);
		}
	}

	@Override
	public void run(SourceContext<T> sourceContext) throws Exception {
		if (fetcher != null) {
			// For non-checkpointed sources, a thread which periodically commits the current offset into ZK.
			PeriodicOffsetCommitter<T> offsetCommitter = null;

			// check whether we need to start the periodic checkpoint committer
			StreamingRuntimeContext streamingRuntimeContext = (StreamingRuntimeContext) getRuntimeContext();
			if (!streamingRuntimeContext.isCheckpointingEnabled()) {
				// we use Kafka's own configuration parameter key for this.
				// Note that the default configuration value in Kafka is 60 * 1000, so we use the
				// same here.
				long commitInterval = Long.valueOf(props.getProperty("auto.commit.interval.ms", "60000"));
				offsetCommitter = new PeriodicOffsetCommitter<>(commitInterval, this);
				offsetCommitter.setDaemon(true);
				offsetCommitter.start();
				LOG.info("Starting periodic offset committer, with commit interval of {}ms", commitInterval);
			}

			try {
				fetcher.run(sourceContext, deserializer, lastOffsets);
			} finally {
				if (offsetCommitter != null) {
					offsetCommitter.close();
					try {
						offsetCommitter.join();
					} catch(InterruptedException ie) {
						// ignore interrupt
					}
				}
			}
		}
		else {
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
		
		// close the fetcher to interrupt any work
		Fetcher fetcher = this.fetcher;
		this.fetcher = null;
		if (fetcher != null) {
			try {
				fetcher.close();
			}
			catch (IOException e) {
				LOG.warn("Error while closing Kafka connector data fetcher", e);
			}
		}
		
		OffsetHandler offsetHandler = this.offsetHandler;
		this.offsetHandler = null;
		if (offsetHandler != null) {
			try {
				offsetHandler.close();
			}
			catch (IOException e) {
				LOG.warn("Error while closing Kafka connector offset handler", e);
			}
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
		if (lastOffsets == null) {
			LOG.debug("snapshotState() requested on not yet opened source; returning null.");
			return null;
		}
		if (!running) {
			LOG.debug("snapshotState() called on closed source");
			return null;
		}

		if (LOG.isDebugEnabled()) {
			LOG.debug("Snapshotting state. Offsets: {}, checkpoint id: {}, timestamp: {}",
					KafkaTopicPartition.toString(lastOffsets), checkpointId, checkpointTimestamp);
		}

		// the use of clone() is okay here is okay, we just need a new map, the keys are not changed
		//noinspection unchecked
		HashMap<KafkaTopicPartition, Long> currentOffsets = (HashMap<KafkaTopicPartition, Long>) lastOffsets.clone();

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
		if (fetcher == null) {
			LOG.debug("notifyCheckpointComplete() called on uninitialized source");
			return;
		}
		if (!running) {
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
			commitOffsets(checkpointOffsets, this);
		}
		catch (Exception e) {
			if (running) {
				throw e;
			}
			// else ignore exception if we are no longer running
		}
	}
	
	// ------------------------------------------------------------------------
	//  Miscellaneous utilities 
	// ------------------------------------------------------------------------

	protected static List<KafkaTopicPartitionLeader> assignPartitions(List<KafkaTopicPartitionLeader> partitions, int numConsumers, int consumerIndex) {
		checkArgument(numConsumers > 0);
		checkArgument(consumerIndex < numConsumers);
		
		List<KafkaTopicPartitionLeader> partitionsToSub = new ArrayList<>();

		for (int i = 0; i < partitions.size(); i++) {
			if (i % numConsumers == consumerIndex) {
				partitionsToSub.add(partitions.get(i));
			}
		}
		return partitionsToSub;
	}*/

	protected static <T> List<T> assignPartitions(List<T> partitions, int numConsumers, int consumerIndex) {
		checkArgument(numConsumers > 0);
		checkArgument(consumerIndex < numConsumers);

		List<T> partitionsToSub = new ArrayList<>();

		for (int i = 0; i < partitions.size(); i++) {
			if (i % numConsumers == consumerIndex) {
				partitionsToSub.add(partitions.get(i));
			}
		}
		return partitionsToSub;
	}

}
