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

import com.google.common.io.Files;
import org.apache.cassandra.config.DatabaseDescriptor;
import org.apache.cassandra.config.Schema;
import org.apache.cassandra.dht.IPartitioner;
import org.apache.cassandra.exceptions.InvalidRequestException;
import org.apache.cassandra.io.sstable.CQLSSTableWriter;
import org.joda.time.DateTimeUtils;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.io.File;
import java.io.IOException;
import java.nio.ByteBuffer;
import java.util.List;

/**
 * Responsible for building SSTables on a local file system.
 */
public class Writer {

	private static final Logger LOG = LoggerFactory.getLogger(Writer.class);

	// Cassandra timestamp used when writing data into SSTables
	private static long TIMESTAMP = DateTimeUtils.currentTimeMillis();
	// TTL for the newly-written Cassandra data. 0 means disabled.
	private static int TTL = 0;
	private boolean closed;

	private CQLSSTableWriter writer;
	private String rootDir;
	private String sstableDir;

	private Writer(CQLSSTableWriter writer, String rootDir, String sstableDir) {
		this.writer = writer;
		this.rootDir = rootDir;
		this.sstableDir = sstableDir;
		this.closed = false;
	}

	/**
	 * Appends a list of values (that represents a CQL row) into a SSTable.
	 */
	public void write(List<ByteBuffer> vals) throws IOException {
		try {
			vals.add(RecordUtils.toByteBuffer(TIMESTAMP));
			vals.add(RecordUtils.toByteBuffer(TTL));
			writer.rawAddRow(vals);
		} catch (InvalidRequestException e) {
			throw new IOException(e);
		}
	}

	public void close() {
		try {
			writer.close();
			closed = true;
		} catch (IOException e) {
			throw new RuntimeException(e);
		}
	}

	public boolean isClosed() {
		return closed;
	}

	public static Builder newBuilder() {
		return new Builder();
	}

	public String getSSTableDir() {
		return sstableDir;
	}

	public String getRootDir() {
		return rootDir;
	}

	public static class Builder {

		private CassandraClusterInfo cassClusterInfo;
		private String previousDir = null;
		private int bufferSize = 128;
		private int round = 0;

		public Builder forCluster(CassandraClusterInfo cassClusterInfo) {
			this.cassClusterInfo = cassClusterInfo;
			return this;
		}

		/**
		 * Buffer size means how much raw uncompressed data can go into a SSTable before
		 * the underlying writer will start a new one. It's tricky to reason about.
		 */
		public Builder setBufferSize(int bufferSize) {
			this.bufferSize = bufferSize;
			return this;
		}

		public Builder setRound(int round) {
			this.round = round;
			return this;
		}

		public Builder setPreviousDir(String previousDir) {
			this.previousDir = previousDir;
			return this;
		}

		public Writer build() {

			// get an instance of Cassandra's partitioner
			IPartitioner partitioner = null;
			try {
				String partitionerName = cassClusterInfo.getPartitionerName();
				partitioner = CassandraClusterInfo.getPartitionerInstance(partitionerName);
			} catch (FlinkCassandraException e) {
				String msg = "Can't instantiate Cassandra Partitioner: " +
						cassClusterInfo.getPartitionerName();
				LOG.error(msg);
				throw new RuntimeException(msg);
			}

			// cleanup some static stuff so that the SSTableWriter doesn't crash
			Schema.instance.clear();
			DatabaseDescriptor.setPartitioner(partitioner);

			// find out the temporary directory
			// if some streaming has already happened, the temporary dir is not created anew, but reused
			File rootDir;
			if (previousDir == null) {
				rootDir = Files.createTempDir();
			} else {
				rootDir = new File(previousDir);
			}
			// in the root directory, create a sub-directory for the current round
			String roundDir = String.format("%s/%d", rootDir.getAbsolutePath(), round);
			// in the round directory, create a sub-directory for keyspace and table. Streamer needs this.
			String sstableDir = String.format("%s/%s/%s", roundDir, cassClusterInfo.getKeyspace(),
					cassClusterInfo.getTable());

			// actually create the folders
			new File(sstableDir).mkdirs();

			// build Cassandra's SSTable writer
			CQLSSTableWriter writer = CQLSSTableWriter.builder()
					.forTable(cassClusterInfo.getTableSchema())
					.using(cassClusterInfo.getPreparedStatement())
					.withPartitioner(partitioner)
					.inDirectory(sstableDir)
					.withBufferSizeInMB(bufferSize)
					.build();

			LOG.info(String.format("Writing SSTables to %s with bufferSize %d", sstableDir, bufferSize));
			return new Writer(writer, rootDir.getAbsolutePath(), sstableDir);
		}

	}
}
