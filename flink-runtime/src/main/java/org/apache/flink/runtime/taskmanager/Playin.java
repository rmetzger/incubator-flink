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


package org.apache.flink.runtime.taskmanager;

import com.codahale.metrics.ConsoleReporter;
import com.codahale.metrics.Counter;
import com.codahale.metrics.Gauge;
import com.codahale.metrics.JmxReporter;
import com.codahale.metrics.Metric;
import com.codahale.metrics.MetricFilter;
import com.codahale.metrics.MetricRegistry;
import com.codahale.metrics.json.MetricsModule;
import com.codahale.metrics.jvm.GarbageCollectorMetricSet;
import com.codahale.metrics.jvm.MemoryUsageGaugeSet;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.sun.net.httpserver.HttpExchange;
import com.sun.net.httpserver.HttpHandler;
import com.sun.net.httpserver.HttpServer;
import org.apache.flink.runtime.metrics.MetricsRegistryUtils;
import org.apache.flink.runtime.profiling.types.ThreadProfilingEvent;

import java.io.IOException;
import java.io.OutputStream;
import java.lang.management.ManagementFactory;
import java.lang.management.OperatingSystemMXBean;
import java.net.InetSocketAddress;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.concurrent.TimeUnit;

public class Playin {

	public static void main(String[] args) throws InterruptedException {
		final MetricRegistry mr = new MetricRegistry(); //"taskmanager.cloud-18."
		//final MetricRegistry mr = new MetricRegistry();
		// expose metrics via Jmx (registered now)
		final JmxReporter reporter = JmxReporter.forRegistry(mr).build();
		reporter.start();

		new Thread(new Runnable() {
			@Override
			public void run() {

				// gather standard Jmx metrics
				mr.register("gc", new GarbageCollectorMetricSet());
				mr.register("memory", new MemoryUsageGaugeSet());
				mr.register("load", new Gauge<Double>() {

					@Override
					public Double getValue() {
						return ManagementFactory.getOperatingSystemMXBean().getSystemLoadAverage();
					}
				});

				/*final ConsoleReporter consoleReporter = ConsoleReporter.forRegistry(mr)
						.convertRatesTo(TimeUnit.SECONDS)
						.convertDurationsTo(TimeUnit.MILLISECONDS)
						.build();
				consoleReporter.start(10, TimeUnit.SECONDS); */

			}
		}).start();



		/*try {
			byte[] report = mapper.writeValueAsBytes(mr);
			String rep = new String(report, "utf-8");
			System.out.println("report size "+report.length);
			System.out.println("report "+rep);
			//String s = mapper.writeValueAsString(mr);
			//System.out.println("s = "+s);
		} catch (Throwable e) {
			e.printStackTrace();
		} */

		HttpServer server = null;
		try {
			server = HttpServer.create(new InetSocketAddress(8000), 0);
		} catch (IOException e) {
			e.printStackTrace();
		}
		server.createContext("/test", new MyHandler(mr));
		server.createContext("/alloc", new Allocate());
		server.setExecutor(null); // creates a default executor
		server.start();

		while(true) {
			Thread.sleep(100);
			byte[] mem = new byte[1024*1024];
		}
		/*while(true) {
			Counter c = mr.counter("calls");
			c.inc();
			Thread.sleep(50);
		//	byte[] ser = MetricsRegistryUtils.serialize(mr.getMetrics());

		//	Map<String, Metric> deser = MetricsRegistryUtils.deserialize(ser);

		//	System.out.println("ser size "+ser.length+" bytes.");

		} */

	}
	static class Allocate implements HttpHandler {
		List<byte[]> memory = new ArrayList<byte[]>();
		@Override
		public void handle(HttpExchange httpExchange) throws IOException {
			memory.add(new byte[1024 * 1024]);
		}
	}
	static class MyHandler implements HttpHandler {
		MetricRegistry mr;
		MyHandler(MetricRegistry mr) {
			this.mr = mr;
		}
		ObjectMapper mapper = new ObjectMapper().registerModule(
				new MetricsModule(TimeUnit.SECONDS, TimeUnit.MILLISECONDS, false, MetricFilter.ALL));

		public void handle(HttpExchange t) throws IOException {
			mr.counter("requests").inc();
			String response = mapper.writeValueAsString(mr);
			t.getResponseHeaders().add("Access-Control-Allow-Origin", "*");
			t.sendResponseHeaders(200, response.length());
			OutputStream os = t.getResponseBody();
			os.write(response.getBytes());
			os.close();
		}
	}
}
