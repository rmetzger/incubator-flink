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
import org.apache.flink.api.java.tuple.Tuple3;
import org.junit.Test;

import java.nio.ByteBuffer;
import java.util.List;
import java.util.Map;

import static org.junit.Assert.*;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

public class CassandraOutputFormatTest {

	@Test
	public void testTupleToRow() throws Exception {

		// sample data
		Tuple3<String, String, String> t = new Tuple3<String, String, String>("a", "bb", "ccc");

		// the mapping between tuple items and column names
		Map<Integer, String> tupleToCol = Maps.newHashMap();
		tupleToCol.put(0, "baz"); // first element in the tuple should end up in column 'baz'
		tupleToCol.put(1, "foo"); // the second in column 'foo'
		tupleToCol.put(2, "bar"); // and the last in column 'bar'

		// this represents what's the order of columns in Cassandra schema.
		CassandraClusterInfo cci = mock(CassandraClusterInfo.class);
		when(cci.getColIndex("foo")).thenReturn(0);
		when(cci.getColIndex("bar")).thenReturn(1);
		when(cci.getColIndex("baz")).thenReturn(2);

		CassandraOutputFormat<Tuple3> cof = new CassandraOutputFormat<Tuple3>(cci, tupleToCol);
		List<ByteBuffer> row = cof.tupleToRow(t);

		// first item in the tuple is mapped to column baz, what means it should end up in 3rd row item
		assertEquals(1, row.get(2).array().length);
		// second tuple items -> column foo -> 1st row item
		assertEquals(2, row.get(0).array().length);
		// third tuple item -> column bar -> 2nd row item
		assertEquals(3, row.get(1).array().length);
	}
}
