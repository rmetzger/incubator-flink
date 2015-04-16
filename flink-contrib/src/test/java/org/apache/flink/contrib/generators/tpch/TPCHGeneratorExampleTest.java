package org.apache.flink.contrib.generators.tpch;

import org.apache.flink.api.java.DataSet;
import org.apache.flink.api.java.ExecutionEnvironment;
import org.apache.flink.api.java.io.DiscardingOutputFormat;
import org.apache.flink.contrib.generators.tpch.core.DistributedTpch;
import org.apache.flink.contrib.generators.tpch.programs.TPCHGenerator;
import org.apache.flink.test.util.MultipleProgramsTestBase;
import org.junit.Assert;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.junit.runners.Parameterized;

import java.lang.reflect.Method;

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


@RunWith(Parameterized.class)
public class TPCHGeneratorExampleTest extends MultipleProgramsTestBase {

	public TPCHGeneratorExampleTest(TestExecutionMode mode) {
		super(mode);
	}

	/**
	 * Test that all the reflective constructor calls are working correctly.
	 */
	@Test
	public void testGeneratorInstantiation() throws Exception {
		final ExecutionEnvironment env = ExecutionEnvironment.getExecutionEnvironment();

		DistributedTpch gen = new DistributedTpch(env);
		gen.setScale(0.001);
		String[] methods = new String[] {"generateParts", "generateLineItems", "generateRegions",
				"generateOrders", "generateSuppliers", "generatePartSuppliers",
				"generateNations", "generateCustomers"};
		for(String method : methods) {
			Method rMethod = gen.getClass().getMethod(method);
			DataSet ds = (DataSet) rMethod.invoke(gen);
			ds.output(new DiscardingOutputFormat());
		}
		env.setParallelism(1);
		// execute program
		env.execute("testGeneratorInstantiation");
	}

	// --------------------------------- TPCHGenerator tests -------------
	@Test
	@Ignore
	public void wrongArguments() {
		try {
			TPCHGenerator.main(new String[]{"a"});
		} catch (Exception e) {
			Assert.fail("Failed with : " + e.getMessage());
			e.printStackTrace();
		}
	}
}
