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

import com.google.common.annotations.VisibleForTesting;
import com.google.common.collect.Lists;
import org.apache.flink.api.common.ExecutionConfig;
import org.apache.flink.api.common.io.OutputFormat;
import org.apache.flink.api.common.typeinfo.TypeInformation;
import org.apache.flink.api.java.tuple.Tuple;
import org.apache.flink.api.java.typeutils.InputTypeConfigurable;
import org.apache.flink.configuration.Configuration;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.io.IOException;
import java.nio.ByteBuffer;
import java.util.List;
import java.util.Map;

public class CassandraOutputFormat<T extends Tuple>
		implements OutputFormat<T>, InputTypeConfigurable {

	private static final Logger LOG = LoggerFactory.getLogger(CassandraOutputFormat.class);

	private CassandraClusterInfo cassClusterInfo;
	private Map<Integer, String> tupleToCol;
	private Writer writer;
	private Streamer streamer;
	private int writerRound = 0;
	private int recordsWritten = 0;
	private int recordsPerRound = 500;


	public CassandraOutputFormat(CassandraClusterInfo cassClusterInfo,
			Map<Integer, String> tupleToCol) {
		this(cassClusterInfo, tupleToCol, 500);
	}

	public CassandraOutputFormat(CassandraClusterInfo cassClusterInfo,
			Map<Integer, String> tupleToCol, int recordsPerRound) {
		this.cassClusterInfo = cassClusterInfo;
		this.tupleToCol = tupleToCol;
		this.recordsPerRound = recordsPerRound;
	}


	@Override
	public void configure(Configuration parameters) {
	}

	@Override
	public void open(int taskNumber, int numTasks) throws IOException {
		// at the beginning of the dump
		writer = Writer.newBuilder()
				.forCluster(cassClusterInfo)
				.setRound(writerRound)
				.build();
		streamer = Streamer.newBuilder()
				.forCluster(cassClusterInfo)
				.build();
	}

	@Override
	public void writeRecord(T record) throws IOException {

		// convert the tuple into a list of ByteBuffer to be passed to SSTable writer
		List<ByteBuffer> vals = tupleToRow(record);

		// append the values to the SSTable
		writer.write(vals);

		// if the SSTable is big enough, stream it, and start writing a new one
		if (++recordsWritten == recordsPerRound) {
			LOG.info(String.format("Wrote %d records, will stream now.", recordsWritten));
			writer.close();
			streamer.stream(writer.getSSTableDir());
			writer = Writer.newBuilder()
					.forCluster(cassClusterInfo)
					.setRound(++writerRound)
					.setPreviousDir(writer.getRootDir())
					.build();
			recordsWritten = 0;
		}
	}

	/**
	 * Takes a Flink's Tuple and re-orders items from the tuple according to tupleToCol mapping.
	 *
	 * @return reordered tuple as a List, with values converted into ByteBuffers.
	 */
	@VisibleForTesting
	protected List<ByteBuffer> tupleToRow(T record) {
		List<ByteBuffer> vals = Lists.newArrayList(new ByteBuffer[record.getArity()]);
		for (int i = 0; i < record.getArity(); i++) {
			String colName = tupleToCol.get(i);
			int indexInStatement = cassClusterInfo.getColIndex(colName);
			vals.set(indexInStatement, RecordUtils.toByteBuffer(record.getField(i)));
		}
		return vals;
	}

	@Override
	public void close() throws IOException {
		// send remaining stuff to C*
		LOG.info("close() called, will stream whatever is left in buffers");
		if (!writer.isClosed()) {
			writer.close();
			streamer.stream(writer.getSSTableDir());
		}
	}

	@Override
	public void setInputType(TypeInformation<?> type, ExecutionConfig executionConfig) {
		// extract fields from the type,
		// so that they are serializable and available when the runs on the cluster
	}
}
