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

import org.apache.flink.client.FlinkYarnSessionCli;
import org.junit.Assert;
import org.junit.Test;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.io.ByteArrayOutputStream;
import java.io.PrintStream;

public class YARNSessionIT extends YarnTestBase {

	private static ByteArrayOutputStream outContent;
	private static ByteArrayOutputStream errContent;

	static {
		outContent = new ByteArrayOutputStream();
		errContent = new ByteArrayOutputStream();
		System.setOut(new PrintStream(outContent));
		System.setErr(new PrintStream(errContent));
	}

	private static final Logger LOG = LoggerFactory.getLogger(YARNSessionIT.class);

	/**
	 * Test regular operation, including command line parameter parsing.
	 */
	@Test
	public void testClientStartup() {

		final int START_TIMEOUT_SECONDS = 30;

		Thread runner = new Thread(new Runnable() {
			@Override
			public void run() {
				int ret = FlinkYarnSessionCli.run(new String[] {"-j", uberJarLocation, "-n", "1","-jm", "512", "-tm", "1024"});
				if(ret != 0) {
					Assert.fail("The YARN session returned with non-null value="+ret);
				}
			}
		});
		runner.start();

		boolean tmConnected = false;
		for(int second = 0; second <  START_TIMEOUT_SECONDS; second++) {
			try {
				Thread.sleep(1000);
			} catch (InterruptedException e) {
				Assert.fail("Interruption not expected");
			}
			// check output for correct TaskManager startup.
			if(outContent.toString().contains("Number of connected TaskManagers changed to 1. Slots available: 1")
				|| errContent.toString().contains("Number of connected TaskManagers changed to 1. Slots available: 1") ) {
				tmConnected = true;
				runner.stop();
				break;
			}
		}

		Assert.assertTrue("During the timeout period of " + START_TIMEOUT_SECONDS + " no TaskManagers connected to the YARN cluster.",tmConnected);

		System.setOut(null);
    	System.setErr(null);

		LOG.info("Sending stdout content through logger: \n\n"+outContent.toString()+"\n\n");
		LOG.info("Sending stderr content through logger: \n\n"+errContent.toString()+"\n\n");
	}
}
