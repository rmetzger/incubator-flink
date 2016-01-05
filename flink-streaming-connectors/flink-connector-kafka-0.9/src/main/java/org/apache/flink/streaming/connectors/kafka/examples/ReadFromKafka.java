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

package org.apache.flink.streaming.connectors.kafka.examples;

import org.apache.flink.api.java.LocalEnvironment;
import org.apache.flink.api.java.utils.ParameterTool;
import org.apache.flink.configuration.ConfigConstants;
import org.apache.flink.configuration.Configuration;
import org.apache.flink.streaming.api.datastream.DataStream;
import org.apache.flink.streaming.api.environment.LocalStreamEnvironment;
import org.apache.flink.streaming.api.environment.StreamExecutionEnvironment;
import org.apache.flink.streaming.connectors.kafka.FlinkKafkaConsumer;
import org.apache.flink.streaming.util.serialization.SimpleStringSchema;
import org.apache.hadoop.hdfs.DFSClient;


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
		Configuration conf = new Configuration();
	//	conf.setString(ConfigConstants.WEB_);
		conf.setBoolean(ConfigConstants.LOCAL_START_WEBSERVER, true);
		StreamExecutionEnvironment env = //StreamExecutionEnvironment.getExecutionEnvironment();
				LocalStreamEnvironment.createLocalEnvironment(2, conf);
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
