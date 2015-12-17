package org.apache.flink.streaming.connectors.kafka.examples;

import org.apache.flink.api.java.utils.ParameterTool;
import org.apache.flink.streaming.api.datastream.DataStream;
import org.apache.flink.streaming.api.environment.StreamExecutionEnvironment;
import org.apache.flink.streaming.connectors.kafka.FlinkKafkaConsumer;
import org.apache.flink.streaming.util.serialization.SimpleStringSchema;


/**
 * Read Strings from Kafka and print them to standard out.
 * Note: On a cluster, DataStream.print() will print to the TaskManager's .out file!
 *
 * Please pass the following arguments to run the example:
 * 	--topic test --bootstrap.servers localhost:9092 --group.id myconsumer
 *
 */
public class ReadFromKafka {

	public static void main(String[] args) throws Exception {
		StreamExecutionEnvironment env =
				StreamExecutionEnvironment.getExecutionEnvironment();
		env.getConfig().disableSysoutLogging();
		env.setNumberOfExecutionRetries(4);
		env.enableCheckpointing(5000);
		env.setParallelism(2);

		ParameterTool parameterTool = ParameterTool.fromArgs(args);

		DataStream<String> messageStream = env
				.addSource(new FlinkKafkaConsumer<>(
						parameterTool.getRequired("topic"),
						new SimpleStringSchema(),
						parameterTool.getProperties()));

		messageStream.print();

		env.execute("Read from Kafka example");
	}
}
