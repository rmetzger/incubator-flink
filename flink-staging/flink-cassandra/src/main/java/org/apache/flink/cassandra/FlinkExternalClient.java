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

import org.apache.cassandra.auth.IAuthenticator;
import org.apache.cassandra.config.CFMetaData;
import org.apache.cassandra.dht.Range;
import org.apache.cassandra.dht.Token;
import org.apache.cassandra.io.sstable.SSTableLoader;
import org.apache.cassandra.thrift.AuthenticationRequest;
import org.apache.cassandra.thrift.Cassandra;
import org.apache.cassandra.thrift.CfDef;
import org.apache.cassandra.thrift.KsDef;
import org.apache.cassandra.thrift.TFramedTransportFactory;
import org.apache.cassandra.thrift.TokenRange;
import org.apache.thrift.protocol.TBinaryProtocol;
import org.apache.thrift.transport.TTransport;
import org.apache.thrift.transport.TTransportException;

import java.net.InetAddress;
import java.net.UnknownHostException;
import java.util.HashMap;
import java.util.HashSet;
import java.util.Iterator;
import java.util.List;
import java.util.Map;
import java.util.Set;

/**
 * This class is a merged copy of {@link org.apache.cassandra.hadoop.cql3.CqlBulkRecordWriter.ExternalClient}
 * and {@link org.apache.cassandra.hadoop.AbstractBulkRecordWriter.ExternalClient}.
 * <p/>
 * The difference is that this class does not use Hadoop Configuration object. This is done so that
 * the dependency on Hadoop libraries can be removed altogether.
 */
public class FlinkExternalClient extends SSTableLoader.Client {

	private final Map<String, Map<String, CFMetaData>> knownCfs =
			new HashMap<String, Map<String, CFMetaData>>();
	private Map<String, Map<String, CFMetaData>> knownCqlCfs =
			new HashMap<String, Map<String, CFMetaData>>();
	private final String hostlist;
	private final int rpcPort;
	private final String username;
	private final String password;

	public FlinkExternalClient(String hostlist, int rpcPort, String username, String password) {
		super();
		this.hostlist = hostlist;
		this.rpcPort = rpcPort;
		this.username = username;
		this.password = password;
	}

	public void init(String keyspace) {
		Set<InetAddress> hosts = new HashSet<InetAddress>();
		String[] nodes = hostlist.split(",");
		for (String node : nodes) {
			try {
				hosts.add(InetAddress.getByName(node));
			} catch (UnknownHostException e) {
				throw new RuntimeException(e);
			}
		}
		Iterator<InetAddress> hostiter = hosts.iterator();
		while (hostiter.hasNext()) {
			try {
				InetAddress host = hostiter.next();
				Cassandra.Client client = createConnection(host.getHostAddress(), rpcPort);

				// log in
				client.set_keyspace(keyspace);
				if (username != null) {
					Map<String, String> creds = new HashMap<String, String>();
					creds.put(IAuthenticator.USERNAME_KEY, username);
					creds.put(IAuthenticator.PASSWORD_KEY, password);
					AuthenticationRequest authRequest = new AuthenticationRequest(creds);
					client.login(authRequest);
				}

				List<TokenRange> tokenRanges = client.describe_ring(keyspace);
				List<KsDef> ksDefs = client.describe_keyspaces();

				setPartitioner(client.describe_partitioner());
				Token.TokenFactory tkFactory = getPartitioner().getTokenFactory();

				for (TokenRange tr : tokenRanges) {
					Range<Token> range = new Range<Token>(tkFactory.fromString(tr.start_token),
							tkFactory.fromString(tr.end_token));
					for (String ep : tr.endpoints) {
						addRangeForEndpoint(range, InetAddress.getByName(ep));
					}
				}

				for (KsDef ksDef : ksDefs) {
					Map<String, CFMetaData> cfs = new HashMap<String, CFMetaData>(ksDef.cf_defs.size());
					for (CfDef cfDef : ksDef.cf_defs)
						cfs.put(cfDef.name, CFMetaData.fromThrift(cfDef));
					knownCfs.put(ksDef.name, cfs);
				}
				break;
			} catch (Exception e) {
				if (!hostiter.hasNext()) {
					throw new RuntimeException("Could not retrieve endpoint ranges: ", e);
				}
			}
		}
	}

	private CFMetaData getCFMetaDataInternal(String keyspace, String cfName) {
		Map<String, CFMetaData> cfs = knownCfs.get(keyspace);
		return cfs != null ? cfs.get(cfName) : null;
	}

	public CFMetaData getCFMetaData(String keyspace, String cfName) {
		CFMetaData metadata = getCFMetaDataInternal(keyspace, cfName);
		if (metadata != null) {
			return metadata;
		}
		Map<String, CFMetaData> cfs = knownCqlCfs.get(keyspace);
		return cfs != null ? cfs.get(cfName) : null;
	}

	public Cassandra.Client createConnection(String host, int port) {
		try {
			TTransport transport = new TFramedTransportFactory().openTransport(host, port);
			return new Cassandra.Client(new TBinaryProtocol(transport, true, true));
		} catch (TTransportException e) {
			throw new RuntimeException(e);
		}
	}

	public void addKnownCfs(String keyspace, String cql) {
		Map<String, CFMetaData> cfs = knownCqlCfs.get(keyspace);
		if (cfs == null) {
			cfs = new HashMap<String, CFMetaData>();
			knownCqlCfs.put(keyspace, cfs);
		}
		CFMetaData metadata = CFMetaData.compile(cql, keyspace);
		cfs.put(metadata.cfName, metadata);
	}

}
