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
import org.apache.cassandra.dht.BigIntegerToken;
import org.apache.cassandra.dht.IPartitioner;
import org.apache.cassandra.dht.LongToken;
import org.apache.cassandra.dht.Murmur3Partitioner;
import org.apache.cassandra.dht.RandomPartitioner;
import org.apache.cassandra.dht.Token;
import org.apache.flink.api.common.functions.Partitioner;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.math.BigInteger;

public class CassandraFlinkPartitioner<K> implements Partitioner<K> {

	private static final Logger LOG = LoggerFactory.getLogger(CassandraFlinkPartitioner.class);

	private static final BigInteger MURMUR3_SCALE =
			BigInteger.valueOf(Murmur3Partitioner.MINIMUM.token).abs();

	private transient IPartitioner partitioner;

	private String cassPartitionerName;
	private BigInteger maxToken;
	private BigInteger minToken;

	public CassandraFlinkPartitioner(String partitioner) {
		cassPartitionerName = partitioner;
		configure();
	}

	/**
	 * Figure out what are the min/max tokens of the Cassandra partitioner.
	 */
	private void configure() {
		if (partitioner == null) {
			try {
				partitioner = CassandraClusterInfo.getPartitionerInstance(cassPartitionerName);
			} catch (FlinkCassandraException e) {
				throw new RuntimeException("Unknown partitioner: " + cassPartitionerName);
			}
			if (partitioner instanceof RandomPartitioner) {
				maxToken = RandomPartitioner.MAXIMUM.subtract(BigInteger.ONE);
				minToken = RandomPartitioner.ZERO;
			} else if (partitioner instanceof Murmur3Partitioner) {
				maxToken = BigInteger.valueOf(Murmur3Partitioner.MAXIMUM);
				minToken = BigInteger.valueOf(Murmur3Partitioner.MINIMUM.token);
			} else {
				String msg = "Unexpected partitioner instance: " + cassPartitionerName.getClass();
				LOG.error(msg);
				throw new RuntimeException(msg);
			}
			LOG.debug(String.format("Min token: %s, max token: %s", minToken.toString(),
					maxToken.toString()));
		}
	}

	/**
	 * Use an instance of Cassandra partitioner to decide what partition should the key go to.
	 *
	 * @param key           The key.
	 * @param numPartitions The number of partitions to partition into.
	 * @return
	 */
	@Override
	public int partition(K key, int numPartitions) {
		configure();
		final Token token = partitioner.getToken(RecordUtils.toByteBuffer(key));
		BigInteger bigIntToken;
		if (token instanceof BigIntegerToken) {
			bigIntToken = ((BigIntegerToken) token).token.abs();
		} else if (token instanceof LongToken) {
			bigIntToken = BigInteger.valueOf(((LongToken) token).token).add(MURMUR3_SCALE);
		} else {
			throw new RuntimeException("Unexpected partitioner Token type. Only BigIntegerToken " +
					"and LongToken supported");
		}
		return bigIntToken.divide(getRangePerPartition(numPartitions)).intValue();
	}

	/**
	 * Splits the range of values a Cassandra partitioner hashes into, and returns how many tokens
	 * fit into one chunk.
	 * <p/>
	 * For RandomPartitioner, the full range is <0, 2^127-1>.
	 * For Murmur3Partitioner, the full range is <-2^63, +2^63-1>.
	 * <p/>
	 * Splitting the RandomPartitioner range into 1 chunk returns 2^127; splitting into 2 returns
	 * 1/2 of that, etc.
	 *
	 * @param numPartitions how many chunks split the partitioner range into.
	 * @return number of tokens in one chunk
	 */
	@VisibleForTesting
	protected BigInteger getRangePerPartition(int numPartitions) {
		final BigInteger[] rangeWidth = maxToken
				.subtract(minToken)
				.add(BigInteger.ONE)
				.divideAndRemainder(BigInteger.valueOf(numPartitions));
		if (!rangeWidth[1].equals(BigInteger.ZERO)) {
			rangeWidth[0] = rangeWidth[0].add(BigInteger.ONE);
		}
		return rangeWidth[0];
	}

}
