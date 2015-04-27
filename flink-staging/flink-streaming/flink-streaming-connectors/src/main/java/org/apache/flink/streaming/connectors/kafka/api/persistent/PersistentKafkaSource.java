package org.apache.flink.streaming.connectors.kafka.api.persistent;

import com.google.common.base.Preconditions;
import kafka.consumer.Consumer;
import kafka.consumer.ConsumerConfig;
import kafka.consumer.ConsumerIterator;
import kafka.consumer.KafkaStream;
import kafka.javaapi.consumer.ConsumerConnector;
import kafka.message.MessageAndMetadata;
import org.apache.commons.math.optimization.general.Preconditioner;
import org.apache.flink.api.common.functions.RuntimeContext;
import org.apache.flink.api.common.typeinfo.TypeInformation;
import org.apache.flink.api.java.typeutils.ResultTypeQueryable;
import org.apache.flink.api.java.typeutils.TypeExtractor;
import org.apache.flink.configuration.Configuration;
import org.apache.flink.streaming.api.functions.source.ParallelSourceFunction;
import org.apache.flink.streaming.api.functions.source.RichSourceFunction;
import org.apache.flink.streaming.util.serialization.DeserializationSchema;
import org.apache.flink.util.Collector;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.io.IOException;
import java.io.ObjectInputStream;
import java.io.ObjectOutputStream;
import java.util.Collections;
import java.util.List;
import java.util.Map;
import java.util.Properties;

/**
 * Source for reading from Kafka using Flink Streaming Fault Tolerance.
 * This source is updating the committed offset in Zookeeper based on the internal checkpointing of Flink.
 *
 * Note that the autocommit feature of Kafka needs to be disabled for using this source.
 */
public class PersistentKafkaSource<OUT> extends RichSourceFunction<OUT> implements ParallelSourceFunction<OUT>, ResultTypeQueryable<OUT> {
	private static final Logger LOG = LoggerFactory.getLogger(PersistentKafkaSource.class);

	protected transient ConsumerConfig consumerConfig;
	private transient ConsumerIterator<byte[], byte[]> streamToRead;
	private String topicName;
	private DeserializationSchema<OUT> deserializationSchema;
	private boolean running = true;


	/**
	 *
	 * For the @param consumerConfig, specify at least the "groupid" and "zookeeper.connect" string.
	 * The config will be passed into the Kafka High Level Consumer.
	 * For a full list of possible values, check this out: https://kafka.apache.org/documentation.html#consumerconfigs
	 */
	public PersistentKafkaSource(String topicName, DeserializationSchema<OUT> deserializationSchema, ConsumerConfig consumerConfig) {
		Preconditions.checkNotNull(topicName);
		Preconditions.checkNotNull(deserializationSchema);
		Preconditions.checkNotNull(consumerConfig);

		this.topicName = topicName;
		this.deserializationSchema = deserializationSchema;
		this.consumerConfig = consumerConfig;
		if(consumerConfig.autoCommitEnable()) {
			throw new IllegalArgumentException("'auto.commit.enable' is set to 'true'. " +
					"This source can only be used with auto commit disabled because the " +
					"source is committing to zookeeper by itself (not using the KafkaConsumer).");
		}
		if(!consumerConfig.offsetsStorage().equals("zookeeper")) {
			// we can currently only commit to ZK.
			throw new IllegalArgumentException("The 'offsets.storage' has to be set to 'zookeeper' for this Source to work reliably");
		}
	}

	// ---------------------- ParallelSourceFunction Lifecycle -----------------


	@Override
	public void open(Configuration parameters) throws Exception {
		super.open(parameters);
		int parallelInstances = getRuntimeContext().getNumberOfParallelSubtasks();
		int instanceId = getRuntimeContext().getIndexOfThisSubtask();

		ConsumerConnector consumer = Consumer.createJavaConsumerConnector(this.consumerConfig);
		Map<String,Integer> topicCountMap = Collections.singletonMap(topicName, parallelInstances);
		Map<String, List<KafkaStream<byte[], byte[]>>> streams = consumer.createMessageStreams(topicCountMap);
		if(streams.size() != 1) {
			throw new RuntimeException("Expected only one message stream but got "+streams.size());
		}
		List<KafkaStream<byte[], byte[]>> kafkaStreams = streams.get(topicName);
		if(kafkaStreams == null) {
			throw new RuntimeException("Requested stream not available. Available streams: "+streams.toString());
		}
		if(kafkaStreams.size() != parallelInstances) {
			throw new RuntimeException("Requested "+parallelInstances+" streams from Kafka, bot got "+kafkaStreams.size()+" streams");
		}
		LOG.info("Opening Consumer instance {} out of {} parallel instances for topic '{}'", instanceId + 1, parallelInstances, topicName);
		this.streamToRead = kafkaStreams.get(instanceId).iterator();
	}


	@Override
	public void run(Collector<OUT> collector) throws Exception {
		if(streamToRead == null) {
			throw new RuntimeException("Stream to read not initialized properly. Has open() been called");
		}
		while(streamToRead.hasNext()) {
			if(!running) {
				LOG.info("Source got stopped");
				break;
			}
			MessageAndMetadata<byte[], byte[]> message = streamToRead.next();
			OUT out = deserializationSchema.deserialize(message.message());
			if(deserializationSchema.isEndOfStream(out)) {
				LOG.info("DeserializationSchema signaled end of stream for this source");
				break;
			}

			// we have the offset here: message.offset()

			collector.collect(out);
			if(LOG.isTraceEnabled()) {
				RuntimeContext rc = getRuntimeContext();
				LOG.trace("Processed record with offset {} from parallel source {}/{}", message.offset(), rc.getIndexOfThisSubtask(), rc.getNumberOfParallelSubtasks());
			}
		}
		LOG.info("Source has finished reading data from the KafkaStream");
	}

	@Override
	public void cancel() {
		LOG.info("Instructing source to stop reading data from Kafka");
		running = false;
	}



	// ---------------------- (Java)Serialization methods for the consumerConfig -----------------

	private void writeObject(ObjectOutputStream out)
			throws IOException, ClassNotFoundException {
		out.defaultWriteObject();
		out.writeObject(consumerConfig.props().props());
	}

	private void readObject(ObjectInputStream in)
			throws IOException, ClassNotFoundException {
		in.defaultReadObject();
		Properties props = (Properties) in.readObject();
		consumerConfig = new ConsumerConfig(props);
	}


	@Override
	public TypeInformation<OUT> getProducedType() {
		return deserializationSchema.getProducedType();
	}
}
