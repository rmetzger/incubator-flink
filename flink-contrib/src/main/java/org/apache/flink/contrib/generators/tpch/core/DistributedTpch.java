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

package org.apache.flink.contrib.generators.tpch.core;

import io.airlift.tpch.Customer;
import io.airlift.tpch.CustomerGenerator;
import io.airlift.tpch.LineItem;
import io.airlift.tpch.LineItemGenerator;
import io.airlift.tpch.Nation;
import io.airlift.tpch.NationGenerator;
import io.airlift.tpch.Order;
import io.airlift.tpch.OrderGenerator;
import io.airlift.tpch.Part;
import io.airlift.tpch.PartGenerator;
import io.airlift.tpch.PartSupplier;
import io.airlift.tpch.PartSupplierGenerator;
import io.airlift.tpch.Region;
import io.airlift.tpch.RegionGenerator;
import io.airlift.tpch.Supplier;
import io.airlift.tpch.SupplierGenerator;
import org.apache.flink.api.java.DataSet;
import org.apache.flink.api.java.ExecutionEnvironment;
import org.apache.flink.util.SplittableIterator;

public class DistributedTpch {
	private double scale;
	private ExecutionEnvironment env;


	public DistributedTpch(ExecutionEnvironment env) {
		this.env = env;
	}

	public void setScale(double scale) {
		this.scale = scale;
	}

	public double getScale() {
		return scale;
	}

	public DataSet<Part> generateParts() {
		return getGenerator(PartGenerator.class, Part.class);
	}

	public DataSet<LineItem> generateLineItems() {
		return getGenerator(LineItemGenerator.class, LineItem.class);
	}
	public DataSet<Order> generateOrders() {
		return getGenerator(OrderGenerator.class, Order.class);
	}

	public DataSet<Supplier> generateSuppliers() {
		return getGenerator(SupplierGenerator.class, Supplier.class);
	}

	public DataSet<Region> generateRegions() {
		return getGenerator(RegionGenerator.class, Region.class);
	}

	public DataSet<Nation> generateNations() {
		return getGenerator(NationGenerator.class, Nation.class);
	}

	public DataSet<Customer> generateCustomers() {
		return getGenerator(CustomerGenerator.class, Customer.class);
	}

	public DataSet<PartSupplier> generatePartSuppliers() {
		return getGenerator(PartSupplierGenerator.class, PartSupplier.class);
	}

	public <T> DataSet<T> getGenerator(Class<? extends Iterable<T>> generatorClass, Class<T> type) {
		SplittableIterator<T> si = new TPCHGeneratorSplittableIterator(scale, env.getParallelism(), generatorClass);
		return env.fromParallelCollection(si, type).name("Generator: "+generatorClass);
	}
}
