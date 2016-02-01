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
package org.apache.flink.streaming.connectors.cassandra.example;

import org.apache.flink.api.java.tuple.Tuple5;
import org.apache.flink.streaming.api.environment.StreamExecutionEnvironment;
import org.apache.flink.streaming.api.functions.source.SourceFunction;
import org.apache.flink.streaming.connectors.cassandra.CassandraSink;

import java.util.HashSet;
import java.util.UUID;

public class example {

	public static void main(String[] args) throws Exception {

		class MySource implements SourceFunction<Tuple5<UUID, String, String, String, HashSet<String>>> {
			@Override
			public void run(SourceContext<Tuple5<UUID, String, String, String, HashSet<String>>> ctx) throws Exception {
				while (true) {
					HashSet<String> tags = new HashSet<>();
					tags.add("hello");
					tags.add("world");
					ctx.collect(new Tuple5<>(UUID.randomUUID(), "hello", "world", "update", tags));
				}
			}

			@Override
			public void cancel() {
			}
		}

		StreamExecutionEnvironment env = StreamExecutionEnvironment.getExecutionEnvironment();
		env
			.addSource(new MySource())
			//==============================>
			.addSink(new CassandraSink("127.0.0.1", "INSERT INTO simplex.songs (id, title, album, artist, tags) VALUES (?, ?, ?, ?, ?)"));
			//==============================>

		env.execute();
	}
}
