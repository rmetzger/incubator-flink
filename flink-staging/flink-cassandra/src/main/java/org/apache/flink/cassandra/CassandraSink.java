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

import com.google.common.collect.Maps;
import org.apache.flink.api.java.DataSet;
import org.apache.flink.api.java.operators.PartitionOperator;
import org.apache.flink.api.java.tuple.Tuple;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.util.Map;

public class CassandraSink {

	private static final Logger LOG = LoggerFactory.getLogger(CassandraSink.class);

	private final CassandraClusterInfo cassClusterInfo;
	private final int keyIndex;
	private final int streamChunkSize;

	private CassandraSink(CassandraClusterInfo cassClusterInfo, int keyIndex, int streamChunkSize) {
		this.cassClusterInfo = cassClusterInfo;
		this.keyIndex = keyIndex;
		this.streamChunkSize = streamChunkSize;
	}

	/**
	 * Dumps a set of tuples into Cassandra.
	 * <p/>
	 * This is done with the assumption that items in the tuple are ordered EXACTLY the same way
	 * as columns in the automatically generated insert statement are.
	 */
	public void sendtoCassandra(DataSet<? extends Tuple> data) {
		String[] colNames = cassClusterInfo.getColumnNames();
		Map<Integer, String> tupleposToCqlCol = Maps.newHashMap();
		for (int i = 0; i < colNames.length; i++) {
			tupleposToCqlCol.put(i, colNames[i]);
		}
		sendtoCassandra(data, tupleposToCqlCol);
	}


	/**
	 * Dumps a set of tuples into Cassandra.
	 *
	 * @param tupleToCol allows specifying the mapping between items in the tuple and their intended
	 *                   column names in Cassandra.
	 */
	public void sendtoCassandra(DataSet<? extends Tuple> data, Map<Integer, String> tupleToCol) {

		CassandraFlinkPartitioner<Tuple> flinkPartitioner =
				new CassandraFlinkPartitioner<Tuple>(cassClusterInfo.getPartitionerName());

		// here 0 is the first item in the tuple
		// partition the data according to cassandra's partitioner
		PartitionOperator<Tuple> partitionOp =
				(PartitionOperator<Tuple>) data.partitionCustom(flinkPartitioner, keyIndex);
		partitionOp.setParallelism(cassClusterInfo.getNumHosts());
		LOG.info(String.format("Parallelism set to %d", partitionOp.getParallelism()));

		// send the data
		partitionOp
				.output(new CassandraOutputFormat<Tuple>(cassClusterInfo, tupleToCol, streamChunkSize));
	}

	public static Builder newBuilder() {
		return new Builder();
	}

	public static class Builder {
		private String seedHost;
		private int seedPort = 9042;
		private int rpcPort = 7000;
		private String keyspace;
		private String table;
		private int keyIndex = 0;
		private int streamChunkSize = 500;

		public CassandraSink build() {
			CassandraClusterInfo cassClusterInfo = new CassandraClusterInfo(seedHost, seedPort, rpcPort);
			cassClusterInfo.init(keyspace, table);
			return new CassandraSink(cassClusterInfo, keyIndex, streamChunkSize);
		}

		public Builder setSeedHost(String seedHost) {
			this.seedHost = seedHost;
			return this;
		}

		/**
		 * @param seedPort number of the port Cassandra java-driver or cqlsh connect to. Defaults 9042.
		 */
		public Builder setSeedPort(int seedPort) {
			this.seedPort = seedPort;
			return this;
		}

		/**
		 * @param rpcPort number of the port Cassandra uses to stream data. Default 7000.
		 */
		public Builder setRpcPort(int rpcPort) {
			this.rpcPort = rpcPort;
			return this;
		}

		public Builder setKeyspace(String keyspace) {
			this.keyspace = keyspace;
			return this;
		}

		public Builder setTable(String table) {
			this.table = table;
			return this;
		}

		/**
		 * @param index index of the tuple item to be used as Cassandra partition key
		 */
		public Builder setKeyIndex(int index) {
			this.keyIndex = index;
			return this;
		}

		/**
		 * @param size how many tuples to buffer before streaming them.
		 */
		public Builder setStreamChunkSize(int size) {
			this.streamChunkSize = size;
			return this;
		}
	}

}
