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
package org.apache.flink.yarn;

import org.apache.hadoop.fs.Path;
import org.junit.Assert;
import org.junit.Test;

public class UtilsTests {
	@Test
	public void testPaths() {
		Assert.assertTrue(Utils.hasLog4j(new Path("file:///home/hadoop/flink-yarn/log4j.properties")));
		Assert.assertTrue(Utils.hasLog4j(new Path("hdfs:///conf/log4j.properties")));

		Assert.assertFalse(Utils.hasLog4j(new Path("hdfs:///conf/lasdog4j.properties")));
		Assert.assertFalse(Utils.hasLog4j(new Path("log4j")));
		Assert.assertFalse(Utils.hasLog4j(new Path("properties")));
		Assert.assertFalse(Utils.hasLog4j(new Path("jiojweflog4j.propertieshsauodhuiohuiwehg")));

		Assert.assertTrue(Utils.hasLogback(new Path("file:///home/hadoop/flink-yarn/logback.xml")));
		Assert.assertTrue(Utils.hasLogback(new Path("file:///home/logback.xml")));

		Assert.assertFalse(Utils.hasLogback(new Path("file:///home/logback.xml.backup")));
		Assert.assertFalse(Utils.hasLogback(new Path("file:///home/logback.xfml")));
	}

	@Test
	public void testHeapCutoff() {

		// ASSUMES DEFAULT Configuration values.
		Assert.assertEquals(800, Utils.calculateHeapSize(1000) );
		Assert.assertEquals(9500, Utils.calculateHeapSize(10000) );
	}
}
