package org.apache.flink.streaming.connectors.kinesis.examples;


import org.apache.flink.api.java.utils.ParameterTool;
import org.apache.flink.streaming.api.datastream.DataStream;
import org.apache.flink.streaming.api.datastream.DataStreamSource;
import org.apache.flink.streaming.api.environment.StreamExecutionEnvironment;
import org.apache.flink.streaming.connectors.kinesis.FlinkKinesisConsumer;
import org.apache.flink.streaming.util.serialization.SimpleStringSchema;

import java.util.Properties;

public class ReadFromKinesis {

	public static void main(String[] args) throws Exception {
		StreamExecutionEnvironment see = StreamExecutionEnvironment.getExecutionEnvironment();
		 // String stream, DeserializationSchema<T> deserializer, Properties configProps
		Properties props = new Properties();
		// props.
		props.putAll(ParameterTool.fromArgs(args).toMap());
		DataStream<String> stream = see.addSource(new FlinkKinesisConsumer<>("flink-test", new SimpleStringSchema(), props));

		stream.print();

		see.execute("Read from Kinesis");
	}

}
