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
package org.apache.flink.streaming.connectors.kinesis;


import com.amazonaws.auth.BasicAWSCredentials;
import com.amazonaws.internal.StaticCredentialsProvider;
import com.amazonaws.services.kinesis.producer.KinesisProducer;
import com.amazonaws.services.kinesis.producer.KinesisProducerConfiguration;
import com.amazonaws.services.kinesis.producer.UserRecordResult;
import com.google.common.util.concurrent.FutureCallback;
import com.google.common.util.concurrent.Futures;
import com.google.common.util.concurrent.ListenableFuture;
import org.apache.flink.api.java.ClosureCleaner;
import org.apache.flink.configuration.Configuration;
import org.apache.flink.streaming.api.functions.sink.RichSinkFunction;
import org.apache.flink.streaming.util.serialization.SerializationSchema;
import org.apache.flink.util.InstantiationUtil;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import javax.annotation.Nullable;
import java.nio.ByteBuffer;
import java.util.Objects;

public class FlinkKinesisProducer<OUT> extends RichSinkFunction<OUT> {

	private static final Logger LOG = LoggerFactory.getLogger(FlinkKinesisProducer.class);


	private final String region;
	private final String accessKey;
	private final String secretKey;
	private boolean failOnError = false;
	private String defaultStream;
	private String defaultPartition;
	private final SerializationSchema<OUT> schema;

	// ----- Runtime fields

	private transient KinesisProducer producer;
	private transient FutureCallback<UserRecordResult> callback;
	private transient Throwable thrownException;

	public FlinkKinesisProducer(String region, String accessKey, String secretKey, SerializationSchema<OUT> schema) {
		this.region = Objects.requireNonNull(region);
		this.accessKey = Objects.requireNonNull(accessKey);
		this.secretKey = Objects.requireNonNull(secretKey);
		ClosureCleaner.ensureSerializable(Objects.requireNonNull(schema));
		this.schema = schema;

	}


	public void setFailOnError(boolean failOnError) {
		this.failOnError = failOnError;
	}

	public void setDefaultStream(String defaultStream) {
		this.defaultStream = defaultStream;
	}

	public void setDefaultPartition(String defaultPartition) {
		this.defaultPartition = defaultPartition;
	}

	@Override
	public void open(Configuration parameters) throws Exception {
		super.open(parameters);

		KinesisProducerConfiguration config = new KinesisProducerConfiguration();
		config.setRegion(this.region);
		config.setCredentialsProvider(new StaticCredentialsProvider(new BasicAWSCredentials(this.accessKey, this.secretKey)));
		producer = new KinesisProducer(config);
		callback = new FutureCallback<UserRecordResult>() {
			@Override
			public void onSuccess(UserRecordResult result) {
				if(!result.isSuccessful()) {
					if(failOnError) {
						thrownException = new RuntimeException("Record was not sent successful");
					} else {
						LOG.warn("Record was not sent successful");
					}
				}
			}

			@Override
			public void onFailure(Throwable t) {
				if(failOnError) {
					thrownException = t;
				} else {
					LOG.warn("An exception occurred while processing a record", t);
				}
			}
		};
	}

	@Override
	public void invoke(OUT value) throws Exception {
		if(thrownException != null) {
			if(failOnError) {
				throw new RuntimeException("An exception was thrown while processing a record", thrownException);
			} else {
				LOG.warn("An exception was thrown while processing a record", thrownException);
				thrownException = null; // reset
			}
		}
		String stream = defaultStream;
		String partition = defaultPartition;

		if(stream == null) {
			if(failOnError) {
				throw new RuntimeException("No target stream set");
			} else {
				LOG.warn("No target stream set. Skipping record");
				return;
			}
		}

		byte[] serialized = schema.serialize(value);
		ListenableFuture<UserRecordResult> cb = producer.addUserRecord(stream, partition, ByteBuffer.wrap(serialized));
		Futures.addCallback(cb, callback);
	}
}
