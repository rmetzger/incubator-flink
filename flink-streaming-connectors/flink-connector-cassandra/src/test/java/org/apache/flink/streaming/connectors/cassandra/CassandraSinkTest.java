/**
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 * <p/>
 * http://www.apache.org/licenses/LICENSE-2.0
 * <p/>
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
package org.apache.flink.streaming.connectors.cassandra;

import org.apache.cassandra.config.DatabaseDescriptor;
import org.apache.flink.api.java.tuple.Tuple5;
import org.apache.flink.core.fs.FileSystem;
import org.apache.flink.core.fs.Path;
import org.apache.flink.streaming.connectors.cassandra.util.CassandraServiceDataCleaner;
import org.apache.flink.streaming.connectors.cassandra.util.EmbeddedCassandraService;
import org.junit.After;
import org.junit.AfterClass;
import org.junit.Before;
import org.junit.BeforeClass;
import org.junit.Test;

import java.io.IOException;
import java.util.HashSet;
import java.util.UUID;

public class CassandraSinkTest {

	private static EmbeddedCassandraService cassandra;

	/**
	 * Set embedded cassandra up and spawn it in a new thread.
	 *
	 * @throws IOException
	 * @throws InterruptedException
	 */
	@BeforeClass
	public static void setup() throws IOException {
		// Tell cassandra where the configuration files are.
		// Use the test configuration file.
		Path x = new Path("src/test/conf/cassandra.yaml").makeQualified(FileSystem.getLocalFileSystem());
		System.setProperty("cassandra.config", x.toString());

		cassandra = new EmbeddedCassandraService();
		cassandra.start();
	}

	@Before
	public void createDB() {
		Tester client = new Tester();
		client.connect("127.0.0.1");
		client.createSchema();
		client.querySchema();
		client.close();
	}

	@After
	public void deleteDB() {
		Tester client = new Tester();
		client.connect("127.0.0.1");
		client.querySchema();
		client.deleteDB();
		client.close();
	}

	@AfterClass
	public static void shutdown() {
		try {
			Thread.sleep(5000);
		} catch (InterruptedException e) {
			e.printStackTrace();
		}
		cassandra.stop();
	}

	@Test
	public void test() throws Exception {
		CassandraSink s = new CassandraSink("127.0.0.1", "INSERT INTO simplex.songs (id, title, album, artist, tags) VALUES (?, ?, ?, ?, ?)");
		s.open(null);
		HashSet<String> tags = new HashSet<>();
		tags.add("hello");
		tags.add("world");
		s.invoke(new Tuple5<>(UUID.fromString("752316f8-2e54-4715-9f00-91dcbfa6cf51"), "hello", "world", "update", tags));
		s.close();
	}
}
