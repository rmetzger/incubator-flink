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

import com.google.common.collect.Lists;
import org.apache.cassandra.dht.RandomPartitioner;
import org.apache.commons.lang.RandomStringUtils;
import org.junit.Before;
import org.junit.Test;

import java.math.BigInteger;
import java.util.List;

import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertNotEquals;

public class CassandraFlinkPartitionerTest {

	CassandraFlinkPartitioner<String> cfp;

	@Before
	public void setup() {
		cfp = new CassandraFlinkPartitioner<String>(RandomPartitioner.class.getCanonicalName());
	}

	@Test
	public void testPartition() throws Exception {

		int PARTITIONS = 5;
		int LENGTH = 23;

		assertEquals(3, cfp.partition("foo", PARTITIONS));
		assertEquals(2, cfp.partition("bar", PARTITIONS));
		assertEquals(4, cfp.partition("baz", PARTITIONS));

		// init counters for how many times was a partition hit
		List<Integer> hits = Lists.newArrayList();
		for (int i = 0; i < PARTITIONS; i++) {
			hits.add(0);
		}

		// partition a bunch of random strings
		for (int i = 0; i < 1000; i++) {
			String str = RandomStringUtils.random(LENGTH);
			int p = cfp.partition(str, PARTITIONS);
			hits.set(p, hits.get(p) + 1);
		}

		// check if all the partitions were used
		for (Integer hit : hits) {
			assertNotEquals(Integer.valueOf(0), hit);
		}
	}

	@Test
	public void testGetRangePerPartition() throws Exception {
		assertEquals(
				new BigInteger("170141183460469231731687303715884105728"),
				cfp.getRangePerPartition(1));
		assertEquals(
				new BigInteger("85070591730234615865843651857942052864"),
				cfp.getRangePerPartition(2));
		assertEquals(
				new BigInteger("4050980558582600755516364374187716804"),
				cfp.getRangePerPartition(42));
	}
}
