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

package org.apache.flink.cassandra;

import com.google.common.util.concurrent.Uninterruptibles;
import org.apache.cassandra.hadoop.AbstractBulkRecordWriter;
import org.apache.cassandra.io.sstable.SSTableLoader;
import org.apache.cassandra.streaming.StreamState;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.io.File;
import java.util.concurrent.ExecutionException;
import java.util.concurrent.Future;

/**
 * Responsible for streaming SSTables from local file system to a Cassandra cluster.
 */
public class Streamer {

	private static final Logger LOG = LoggerFactory.getLogger(Streamer.class);

	private final FlinkExternalClient externalClient;
	private final AbstractBulkRecordWriter.NullOutputHandler handler;
	private SSTableLoader loader;

	private Streamer(FlinkExternalClient externalClient) {
		this.externalClient = externalClient;
		this.handler = new AbstractBulkRecordWriter.NullOutputHandler();
	}

	/**
	 * Stream ALL SSTables present it srcDir to a Cassandra cluster.
	 *
	 * @param srcDir directory where to find the SSTables in.
	 *               Needs to point all the way .../keyspace/table
	 */
	public void stream(String srcDir) {
		loader = new SSTableLoader(new File(srcDir), externalClient, handler);
		LOG.info("Starting to stream SSTables from " + srcDir);

		Future<StreamState> future = loader.stream();
		try {
			StreamState streamState = Uninterruptibles.getUninterruptibly(future);
			if (streamState.hasFailedSession()) {
				String msg = "Some streaming sessions failed";
				System.out.println(msg);
				LOG.error(msg);
				throw new RuntimeException(msg);
			}
			LOG.info("Streaming completed successfully");
		} catch (ExecutionException e) {
			e.printStackTrace();
			throw new RuntimeException(e);
		}
	}

	public static Builder newBuilder() {
		return new Builder();
	}

	public static class Builder {

		private String seedHost;
		private int rpcPort;
		private String keyspace;
		private String schema;

		public Builder forCluster(CassandraClusterInfo clusterInfo) {
			this.seedHost = clusterInfo.getSeedHost();
			this.rpcPort = clusterInfo.getRpcPort();
			this.keyspace = clusterInfo.getKeyspace();
			this.schema = clusterInfo.getTableSchema();
			return this;
		}

		public Streamer build() {
			LOG.info(String.format("Opening a streaming client with %s:%d", seedHost, rpcPort));
			// user name and password are left empty
			FlinkExternalClient externalClient = new FlinkExternalClient(seedHost, rpcPort, "", "");
			externalClient.addKnownCfs(keyspace, schema);
			return new Streamer(externalClient);
		}

	}

}
