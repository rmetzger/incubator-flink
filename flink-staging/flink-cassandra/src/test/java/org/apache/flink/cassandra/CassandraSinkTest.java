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

import com.datastax.driver.core.ResultSet;
import com.google.common.collect.Maps;
import com.spotify.cassandra.extra.CassandraRule;
import org.apache.flink.api.java.DataSet;
import org.apache.flink.api.java.ExecutionEnvironment;
import org.apache.flink.api.java.tuple.Tuple2;
import org.apache.flink.examples.java.wordcount.WordCount;
import org.apache.flink.examples.java.wordcount.util.WordCountData;
import org.junit.Rule;
import org.junit.Test;

import java.util.Map;

import static org.junit.Assert.assertEquals;

public class CassandraSinkTest {

	@Rule
	public CassandraRule cassandra = CassandraRule.newBuilder().build();

	@Test
	public void testSendtoCassandra() throws Exception {

		cassandra.getSession().execute(
				"CREATE KEYSPACE testks WITH replication = { 'class': 'SimpleStrategy', 'replication_factor': '1'};");
		cassandra.getSession()
				.execute("CREATE TABLE testks.testtable (word TEXT, cnt INT, PRIMARY KEY (word));");

		final ExecutionEnvironment env = ExecutionEnvironment.getExecutionEnvironment();
		DataSet<String> text = WordCountData.getDefaultTextLineDataSet(env);

		DataSet<Tuple2<String, Integer>> counts =
				// split up the lines in pairs (2-tuples) containing: (word,1)
				text.flatMap(new WordCount.Tokenizer())
						// group by the tuple field "0" and sum up tuple field "1"
						.groupBy(0)
						.sum(1);

		CassandraSink sink = CassandraSink.newBuilder()
				.setSeedHost("localhost")
				.setSeedPort(cassandra.getNativeTransportPort())  // the one CQL shell connects to
//				.setRpcPort(cassandra.getStoragePort())           // the one used for streaming
				.setKeyspace("testks")
				.setTable("testtable")
				.setKeyIndex(0) // first item in the tuple
				.build();

		Map<Integer, String> tuplefieldToCqlcol = Maps.newHashMap();
		tuplefieldToCqlcol.put(0, "word");
		tuplefieldToCqlcol.put(1, "cnt");
		sink.sendtoCassandra(counts, tuplefieldToCqlcol);

		env.execute();

		ResultSet rows = cassandra.getSession().execute("SELECT * FROM testks.testtable");
		assertEquals(counts.count(), rows.all().size());

	}

}
