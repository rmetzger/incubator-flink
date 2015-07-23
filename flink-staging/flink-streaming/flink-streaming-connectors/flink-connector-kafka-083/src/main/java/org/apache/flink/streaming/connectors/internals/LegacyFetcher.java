package org.apache.flink.streaming.connectors.internals;

import kafka.api.FetchRequestBuilder;
import kafka.api.OffsetRequest;
import kafka.api.PartitionOffsetRequestInfo;
import kafka.common.ErrorMapping;
import kafka.common.TopicAndPartition;
import kafka.javaapi.FetchResponse;
import kafka.javaapi.OffsetResponse;
import kafka.javaapi.consumer.SimpleConsumer;
import kafka.javaapi.message.ByteBufferMessageSet;
import kafka.message.MessageAndOffset;
import org.apache.flink.api.java.tuple.Tuple2;
import org.apache.flink.streaming.api.functions.source.SourceFunction;
import org.apache.flink.streaming.util.serialization.DeserializationSchema;
import org.apache.flink.util.StringUtils;
import org.apache.kafka.copied.common.Node;
import org.apache.kafka.copied.common.PartitionInfo;
import org.apache.kafka.copied.common.TopicPartition;
import org.apache.kafka.copied.common.requests.FetchRequest;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.nio.ByteBuffer;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Properties;
import java.util.concurrent.LinkedBlockingQueue;

public class LegacyFetcher implements Fetcher {
	public static Logger LOG = LoggerFactory.getLogger(FlinkKafkaConsumerBase.class);

	private final String topic;
	private Map<TopicPartition, Long> partitionsToRead;
	private boolean running = true;
	private Properties config;

	public final static String QUEUE_SIZE_KEY = "flink.kafka.consumer.queue.size";
	public final static String DEFAULT_QUEUE_SIZE = "10000";


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

		LOG.info("Reading from partitions "+partitionsToRead+" using the legacy fetcher");
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
					fetchBrokers.put(partitionInfo.leader(), partitions);
				}
			}
		}
		if(partitionsToRead.size() != fetchPartitionsCount) {
			throw new RuntimeException(partitionsToRead.size() + " partitions to read, but got only "+fetchPartitionsCount+" partition infos with lead brokers.");
		}
		// Create a queue for the threads to communicate
		int queueSize = Integer.valueOf(config.getProperty(QUEUE_SIZE_KEY, DEFAULT_QUEUE_SIZE));
		LinkedBlockingQueue<Tuple2<MessageAndOffset, Integer>> messageQueue = new LinkedBlockingQueue<Tuple2<MessageAndOffset, Integer>>(queueSize);

		// create SimpleConsumers for each broker
		List<SimpleConsumerThread> consumers = new ArrayList<SimpleConsumerThread>(fetchBrokers.size());
		for(Map.Entry<Node, List<FetchPartition>> brokerInfo: fetchBrokers.entrySet()) {
			SimpleConsumerThread thread = new SimpleConsumerThread(this.config, topic, brokerInfo.getKey(), brokerInfo.getValue(), messageQueue);
			thread.setDaemon(true);
			thread.setName("KafkaConsumer-SimpleConsumer-" + brokerInfo.getKey().idString());
			thread.start();
			consumers.add(thread);
			LOG.info("Starting thread "+thread.getName()+" for fetching from broker "+brokerInfo.getKey().host());
		}

		// read from queue:
		while(running) {
			try {
				Tuple2<MessageAndOffset, Integer> msg = messageQueue.take();
				ByteBuffer payload = msg.f0.message().payload();
				byte[] valueByte = new byte[payload.limit()];
				payload.get(valueByte);
				T value = valueDeserializer.deserialize(valueByte);
				synchronized (sourceContext.getCheckpointLock()) {
					lastOffsets[msg.f1] = msg.f0.offset();
					sourceContext.collect(value);
				}
			} catch (InterruptedException e) {
				LOG.info("Queue consumption thread got interrupted. Stopping consumption and interrupting other threads");
				running = false;
				for(SimpleConsumerThread t: consumers) {
					t.interrupt();
				}
			}
		}
	}

	@Override
	public void stop() {
		running = false;
	}

	@Override
	public void commit(Map<TopicPartition, Long> offsetsToCommit) {
		throw new UnsupportedOperationException("This fetcher does not support committing offsets");
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


	private static class FetchPartition {
		public int partition;
		public long offset;
	//	public long nextFetch;


		@Override
		public String toString() {
			return "FetchPartition{" +
					"partition=" + partition +
					", offset=" + offset +
					'}';
		}
	}

	// --------------------------  Thread for a connection to a broker --------------------------

	private static class SimpleConsumerThread extends Thread {

		private final SimpleConsumer consumer;
		private final List<FetchPartition> partitions;
		private final LinkedBlockingQueue<Tuple2<MessageAndOffset, Integer>> messageQueue;
		private final String clientId;
		private final String topic;

		private final int fetchSize;
		private final int maxWait;
		private final int minBytes;

		private boolean running = true;


		public SimpleConsumerThread(Properties config, String topic, Node leader, List<FetchPartition> partitions, LinkedBlockingQueue<Tuple2<MessageAndOffset, Integer>> messageQueue) {
			// these are the actual configuration values of Kafka + their original default values.
			int soTimeout = Integer.valueOf(config.getProperty("socket.timeout.ms", "30000"));
			int bufferSize = Integer.valueOf(config.getProperty("socket.receive.buffer.bytes", "65536"));

			this.fetchSize = Integer.valueOf(config.getProperty("fetch.message.max.bytes", "1048576"));
			this.maxWait =  Integer.valueOf(config.getProperty("fetch.wait.max.ms", "100"));
			this.minBytes = Integer.valueOf(config.getProperty("fetch.min.bytes", "1"));

			this.topic = topic;
			this.partitions = partitions;
			this.messageQueue = messageQueue;
			this.clientId = "flink-kafka-consumer-legacy-"+leader.idString();
			// create consumer
			consumer = new SimpleConsumer(leader.host(), leader.port(), bufferSize, soTimeout, clientId);
			// check offsets
			List<FetchPartition> getOffsetPartitions = new ArrayList<FetchPartition>();
			for(FetchPartition fp: partitions) {
				if (fp.offset == FlinkKafkaConsumerBase.OFFSET_NOT_SET) {
					// retrieve the offset from the consumer
					getOffsetPartitions.add(fp);
				}
			}
			if(getOffsetPartitions.size() > 0) {
				long timeType = 0;
				if(config.getProperty("auto.offset.reset", "latest" ).equals("latest")) {
					timeType = OffsetRequest.LatestTime();
				} else {
					timeType = OffsetRequest.EarliestTime();
				}
				getLastOffset(consumer, topic, getOffsetPartitions, timeType);
				LOG.info("No offsets found for topic "+topic+", fetched the following start offsets {}", getOffsetPartitions);
			}
		}

		@Override
		public void run() {

			// initialize offset field for first fetch
			for (FetchPartition fp : partitions) {
				fp.offset--;
			}
			while(running) {
				FetchRequestBuilder frb = new FetchRequestBuilder();
				frb.clientId(this.clientId);
				frb.maxWait(maxWait);
				frb.minBytes(minBytes);
				for (FetchPartition fp : partitions) {
					frb.addFetch(topic, fp.partition, fp.offset + 1, this.fetchSize);
				}
				kafka.api.FetchRequest fetchRequest = frb.build();
				LOG.debug("Issuing fetch request {}", fetchRequest);
				FetchResponse fetchResponse = consumer.fetch(fetchRequest);

				if (fetchResponse.hasError()) {
					String exception = "";
					for(FetchPartition fp: partitions) {
						short code;
						if( (code=fetchResponse.errorCode(topic, fp.partition)) != ErrorMapping.NoError()) {
							exception += "\nException for partition "+fp.partition+": "+ StringUtils.stringifyException(ErrorMapping.exceptionFor(code));
						}
					}
					throw new RuntimeException("Error while fetching from broker: "+exception);
				}

				int messagesInFetch = 0;
				for (FetchPartition fp : partitions) {
					ByteBufferMessageSet messageSet = fetchResponse.messageSet(topic, fp.partition);
					for (MessageAndOffset msg : messageSet) {
						messagesInFetch++;
						try {
							if(msg.offset() < fp.offset) {
								LOG.info("Skipping message with offset " + msg.offset() + " because we have seen messages until " + fp.offset + " from partition "+fp.partition+" already");
								// we have seen this message already
								continue;
							}
							messageQueue.put(new Tuple2<MessageAndOffset, Integer>(msg, fp.partition));
							fp.offset = msg.offset(); // advance offset for the next request
							// fp.nextFetch = msg.nextOffset();
						} catch (InterruptedException e) {
							LOG.debug("Consumer thread got interrupted. Stopping consumption");
							running = false;
						}
					}
				}
				LOG.debug("This fetch contained {} messages", messagesInFetch);
			}
			// end of run loop. close connection to consumer
			consumer.close();

		}
	}

	/**
	 * Request latest offsets from Kafka.
	 *
	 * @param consumer consumer connected to lead broker
	 * @param topic topic name
	 * @param partitions list of partitions we need offsets for
	 * @param whichTime type of time we are requesting. -1 and -2 are special constants (See OffsetRequest)
	 */
	private static void getLastOffset(SimpleConsumer consumer, String topic, List<FetchPartition> partitions, long whichTime) {

		Map<TopicAndPartition, PartitionOffsetRequestInfo> requestInfo = new HashMap<TopicAndPartition, PartitionOffsetRequestInfo>();
		for(FetchPartition fp: partitions) {
			TopicAndPartition topicAndPartition = new TopicAndPartition(topic, fp.partition);
			requestInfo.put(topicAndPartition, new PartitionOffsetRequestInfo(whichTime, 1));
		}

		kafka.javaapi.OffsetRequest request = new kafka.javaapi.OffsetRequest(requestInfo, kafka.api.OffsetRequest.CurrentVersion(), consumer.clientId());
		OffsetResponse response = consumer.getOffsetsBefore(request);

		if (response.hasError()) {
			String exception = "";
			for(FetchPartition fp: partitions) {
				short code;
				if( (code=response.errorCode(topic, fp.partition)) != ErrorMapping.NoError()) {
					exception += "\nException for partition "+fp.partition+": "+ StringUtils.stringifyException(ErrorMapping.exceptionFor(code));
				}
			}
			throw new RuntimeException("Unable to get last offset for topic "+topic+" and partitions "+partitions +". "+exception);
		}

		for(FetchPartition fp: partitions) {
			fp.offset = response.offsets(topic, fp.partition)[0];
		}

	}

}
