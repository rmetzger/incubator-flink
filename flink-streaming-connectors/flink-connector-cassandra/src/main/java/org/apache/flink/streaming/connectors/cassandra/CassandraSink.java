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

import com.datastax.driver.core.BatchStatement;
import com.datastax.driver.core.Cluster;
import com.datastax.driver.core.PreparedStatement;
import com.datastax.driver.core.Session;
import org.apache.flink.api.java.tuple.Tuple;
import org.apache.flink.configuration.Configuration;
import org.apache.flink.streaming.api.functions.sink.RichSinkFunction;

public class CassandraSink<IN extends Tuple> extends RichSinkFunction<IN> {
	private Cluster cluster;
	private Session session;
	private String host;
	private String createQuery;
	private String insertQuery;
	private BatchStatement batchQuery;
	private PreparedStatement preparedStatement;

	public CassandraSink(String host, String insertQuery) {
		this(host, null, insertQuery);
	}

	public CassandraSink(String host, String createQuery, String insertQuery) {
		this.host = host;
		this.createQuery = createQuery;
		this.insertQuery = insertQuery;
	}

	@Override
	public void open(Configuration parameters) {
		cluster = Cluster.builder().addContactPoint(host).build();
		session = cluster.connect();
		if (createQuery != null) {
			session.execute(createQuery);
		}
		preparedStatement = session.prepare(insertQuery);
		batchQuery = new BatchStatement();
	}

	@Override
	public void invoke(IN value) throws Exception {
		Object[] fields = new Object[value.getArity()];
		for (int x = 0; x < value.getArity(); x++) {
			fields[x] = value.getField(x);
		}

		batchQuery.add(preparedStatement.bind(fields));
		if (batchQuery.size() > 1000) {
			session.execute(batchQuery);
		}
	}

	@Override
	public void close() throws Exception {
		if (batchQuery.size() > 0) {
			session.execute(batchQuery);
		}
		super.close();
		session.close();
		cluster.close();
	}
}
