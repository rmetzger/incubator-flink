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
package org.apache.flink.contrib.generators.tpch.programs;

import io.airlift.tpch.Customer;
import io.airlift.tpch.LineItem;
import io.airlift.tpch.Nation;
import io.airlift.tpch.Order;
import io.airlift.tpch.Part;
import io.airlift.tpch.PartSupplier;
import io.airlift.tpch.Region;
import io.airlift.tpch.Supplier;
import org.apache.flink.api.java.ExecutionEnvironment;
import org.apache.flink.api.java.utils.ParameterTool;
import org.apache.flink.contrib.generators.tpch.core.DistributedTpch;
import org.apache.flink.contrib.generators.tpch.core.TpchEntityFormatter;

public class TPCHGenerator {
	public static void main(String[] args) throws Exception {
		ParameterTool parameters = ParameterTool.fromArgs(args);

		final ExecutionEnvironment env = ExecutionEnvironment.getExecutionEnvironment();
		env.getConfig().setGlobalJobParameters(parameters);
		env.setParallelism(parameters.getInt("parallelism", 1));

		DistributedTpch gen = new DistributedTpch(env);
		gen.setScale(parameters.getDouble("scale", 1.0));

		String ext = parameters.get("extension", ".csv");
		String base = parameters.getString("outpath", "/tmp/");

		gen.generateParts().writeAsFormattedText(base + "parts" + ext, new TpchEntityFormatter<Part>());
		gen.generateLineItems().writeAsFormattedText(base + "lineitems" + ext, new TpchEntityFormatter<LineItem>());
		gen.generateOrders().writeAsFormattedText(base + "orders" + ext, new TpchEntityFormatter<Order>());
		gen.generateSuppliers().writeAsFormattedText(base + "suppliers" + ext, new TpchEntityFormatter<Supplier>());
		gen.generatePartSuppliers().writeAsFormattedText(base + "partsuppliers" + ext, new TpchEntityFormatter<PartSupplier>());
		gen.generateRegions().writeAsFormattedText(base + "regions" + ext, new TpchEntityFormatter<Region>());
		gen.generateNations().writeAsFormattedText(base + "nations" + ext, new TpchEntityFormatter<Nation>());
		gen.generateCustomers().writeAsFormattedText(base + "customers" + ext, new TpchEntityFormatter<Customer>());

		env.execute("Distributed TPCH Generator, Scale = "+gen.getScale());
	}





}
