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

import com.datastax.driver.core.Cluster;
import com.datastax.driver.core.ColumnMetadata;
import com.datastax.driver.core.KeyspaceMetadata;
import com.datastax.driver.core.Metadata;
import com.datastax.driver.core.TableMetadata;
import com.google.common.annotations.VisibleForTesting;
import com.google.common.collect.Lists;
import com.google.common.collect.Maps;
import org.apache.cassandra.dht.IPartitioner;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.io.Serializable;
import java.util.List;
import java.util.Map;

public class CassandraClusterInfo implements Serializable {

	private static final Logger LOG = LoggerFactory.getLogger(CassandraClusterInfo.class);

	private String seedHost;
	private int seedPort;
	private int rpcPort;
	private String partitionerName;
	private int numClusterNodes;
	private String keyspace;
	private String table;
	private String cqlSchema;
	private String preparedStatement;
	private String[] columnNames;
	private Map<String, Integer> columnamesIndices;

	public CassandraClusterInfo(String seedHost, int seedPort, int rpcPort) {
		this.seedHost = seedHost;
		this.seedPort = seedPort;
		this.rpcPort = rpcPort;
	}

	public void init(String keyspace, String table) {

		this.keyspace = keyspace;
		this.table = table;

		// connect to the cluster
		Cluster.Builder clusterBuilder = Cluster.builder();
		clusterBuilder.addContactPoints(seedHost);
		if (seedPort != -1) {
			clusterBuilder.withPort(seedPort);
		}
		Cluster cluster = clusterBuilder.build();
		LOG.debug("Successfully connected to Cassandra cluster");

		// fetch the meta
		try {
			Metadata clusterMetadata = cluster.getMetadata();
			KeyspaceMetadata keyspaceMetadata = clusterMetadata.getKeyspace(keyspace);
			TableMetadata tableMetadata = keyspaceMetadata.getTable(table);
			cqlSchema = tableMetadata.asCQLQuery();
			columnNames = getAllColumnNames(tableMetadata.getColumns());
			columnamesIndices = buildColIndices(columnNames);
			preparedStatement = buildPreparedStatement(keyspace, table, columnNames);
			LOG.debug("Prepared statement: " + preparedStatement);
			numClusterNodes = clusterMetadata.getAllHosts().size();
			partitionerName = clusterMetadata.getPartitioner();
			LOG.debug("Successfully gathered Cassandra cluster metadata");
		} catch (NullPointerException npe) {
			String msg = String.format("No such keyspace/table: %s/%s", keyspace, table);
			LOG.error(msg);
			throw new RuntimeException(msg, npe);
		} finally {
			cluster.close();
		}
		LOG.debug(this.toString());
	}

	@Override
	public String toString() {
		return String.format(
				"[seedHost=%s, seedPort=%d, rpcPort=%d, partitionerName=%s, numClusterNodes=%d, " +
						"keyspace=%s, table=%s]",
				seedHost, seedPort, rpcPort, partitionerName, numClusterNodes, keyspace, table);
	}

	/**
	 * @param columnNames names of columns in the CQL table
	 * @return mapping of column name to it's index in columnNames
	 */
	@VisibleForTesting
	protected Map<String, Integer> buildColIndices(String[] columnNames) {
		Map<String, Integer> result = Maps.newHashMap();
		for (int i = 0; i < columnNames.length; i++) {
			result.put(columnNames[i], i);
		}
		return result;
	}

	/**
	 * Extract column names from (rather rich) Cassandra's column metadata.
	 */
	private String[] getAllColumnNames(List<ColumnMetadata> columns) {
		List<String> colNames = Lists.newArrayList();
		for (ColumnMetadata col : columns) {
			colNames.add(col.getName());
		}
		return colNames.toArray(new String[colNames.size()]);
	}

	/**
	 * Crafts a parametrised prepared statement that is needed when writing SSTables.
	 *
	 * @param keyspace
	 * @param table
	 * @param columnNames
	 * @return
	 */
	@VisibleForTesting
	protected String buildPreparedStatement(String keyspace, String table, String[] columnNames) {
		StringBuilder colNames = new StringBuilder();
		StringBuilder valueTemplates = new StringBuilder();
		for (String col : columnNames) {
			colNames.append(String.format("%s, ", col));
			valueTemplates.append("?, ");
		}
		// remove last ','
		colNames.deleteCharAt(colNames.lastIndexOf(","));
		valueTemplates.deleteCharAt(valueTemplates.lastIndexOf(","));
		return String.format("INSERT INTO %s.%s (%s) VALUES (%s) USING TIMESTAMP ? AND TTL ?;",
				keyspace, table, colNames.toString(), valueTemplates.toString());
	}

	public int getNumHosts() {
		return numClusterNodes;
	}

	public String getPartitionerName() {
		return partitionerName;
	}

	public String getTableSchema() {
		return cqlSchema;
	}

	public String getPreparedStatement() {
		return preparedStatement;
	}

	public String getKeyspace() {
		return keyspace;
	}

	public String getTable() {
		return table;
	}

	public int getRpcPort() {
		return rpcPort;
	}

	public String getSeedHost() {
		return seedHost;
	}

	public String[] getColumnNames() {
		return columnNames;
	}

	public int getColIndex(String colName) {
		return columnamesIndices.get(colName);
	}

	public static IPartitioner getPartitionerInstance(String partitionerName)
			throws FlinkCassandraException {
		try {
			return (IPartitioner) Class.forName(partitionerName).newInstance();
		} catch (InstantiationException e) {
			throw new FlinkCassandraException(e);
		} catch (IllegalAccessException e) {
			throw new FlinkCassandraException(e);
		} catch (ClassNotFoundException e) {
			throw new FlinkCassandraException(e);
		}
	}

}
