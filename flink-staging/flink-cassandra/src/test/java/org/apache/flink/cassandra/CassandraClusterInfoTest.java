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

import org.junit.Test;

import java.util.Map;

import static org.junit.Assert.*;

public class CassandraClusterInfoTest {

	@Test
	public void testBuildColIndices() throws Exception {
		CassandraClusterInfo cci = new CassandraClusterInfo("foo", 42, 69);
		String[] colNames = {"foo", "bar", "baz"};
		Map<String, Integer> indices = cci.buildColIndices(colNames);
		assertEquals(Integer.valueOf(0), indices.get("foo"));
		assertEquals(Integer.valueOf(1), indices.get("bar"));
		assertEquals(Integer.valueOf(2), indices.get("baz"));
	}

	@Test
	public void testBuildPreparedStatement() throws Exception {
		CassandraClusterInfo cci = new CassandraClusterInfo("foo", 42, 69);
		String[] colNames = {"foo", "bar", "baz"};
		String statement = cci.buildPreparedStatement("ks", "t", colNames);
		assertEquals(
				"INSERT INTO ks.t (foo, bar, baz ) VALUES (?, ?, ? ) USING TIMESTAMP ? AND TTL ?;",
				statement);
	}
}
