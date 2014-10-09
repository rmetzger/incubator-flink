/**
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

import java.io.File;
import java.io.FileWriter;
import java.io.IOException;
import java.util.HashMap;
import java.util.Iterator;
import java.util.Map;
import java.util.Map.Entry;
import java.util.Set;

import org.apache.hadoop.conf.Configuration;
import org.apache.hadoop.yarn.conf.YarnConfiguration;
import org.apache.hadoop.yarn.server.resourcemanager.scheduler.ResourceScheduler;
import org.apache.hadoop.yarn.server.resourcemanager.scheduler.fifo.FifoScheduler;
import org.junit.rules.TemporaryFolder;

public class YarnConfManager {
	private static TemporaryFolder tmp = new TemporaryFolder();


	public Map<String, Object> getDefaultFlinkConfig() {
		Map<String, Object> flinkConf = new HashMap<String, Object>();
		flinkConf.put("jobmanager.rpc.address", "localhost");
		flinkConf.put("jobmanager.rpc.port", 6123);
		flinkConf.put("jobmanager.heap.mb", 256);
		flinkConf.put("taskmanager.heap.mb", 512);
		flinkConf.put("taskmanager.numberOfTaskSlots", -1);
		flinkConf.put("parallelization.degree.default", 1);
		flinkConf.put("jobmanager.web.port", 8081);
		flinkConf.put("webclient.port", 8080);

		return flinkConf;
	}

	public Configuration getMiniClusterConf() {
		Configuration conf = new YarnConfiguration();
		conf.setInt(YarnConfiguration.RM_SCHEDULER_MINIMUM_ALLOCATION_MB, 512);
		conf.setInt(YarnConfiguration.RM_SCHEDULER_MAXIMUM_ALLOCATION_MB, 2 * 1024);
		conf.setBoolean(YarnConfiguration.YARN_MINICLUSTER_FIXED_PORTS, true);
		conf.setClass(YarnConfiguration.RM_SCHEDULER, FifoScheduler.class, ResourceScheduler.class);
		conf.setBoolean(YarnConfiguration.RM_SCHEDULER_INCLUDE_PORT_IN_NODE_NAME, true);
		conf.setInt(YarnConfiguration.RM_AM_MAX_ATTEMPTS, 2);
		conf.setInt(YarnConfiguration.RM_MAX_COMPLETED_APPLICATIONS, 2);
		conf.setInt(YarnConfiguration.DEBUG_NM_DELETE_DELAY_SEC, 3600);
		conf.setBoolean(YarnConfiguration.LOG_AGGREGATION_ENABLED, true);
		return conf;
	}

	public File createYarnSiteConfig(Configuration yarnConf) throws IOException {
		tmp.create();
		File yarnSiteXML = new File(tmp.newFolder().getAbsolutePath() + "/yarn-site.xml");

		FileWriter writer = new FileWriter(yarnSiteXML);
		yarnConf.writeXml(writer);
		writer.flush();
		writer.close();
		return yarnSiteXML;
	}

	public File createConfigFile(Map<String, Object> flinkConf) throws IOException {
		tmp.create();
		File flinkConfFile = new File(tmp.newFolder().getAbsolutePath() + "/flink-conf.yaml");

		FileWriter writer = new FileWriter(flinkConfFile);

		deleteNulls(flinkConf);
		for(Entry<String, Object> el : flinkConf.entrySet()) {
			writer.write(el.getKey()+": "+el.getValue()+"\n");
		}
		writer.flush();
		writer.close();
		return flinkConfFile;
	}

	static <K,V> void deleteNulls(Map<K, V> map) {
		Set<Entry<K,V>> set = map.entrySet();
		Iterator<Entry<K,V>> it = set.iterator();
		while (it.hasNext()) {
			Map.Entry<K,V> m = it.next();
			if (m.getValue() == null) {
				it.remove();
			}
		}
	}
}