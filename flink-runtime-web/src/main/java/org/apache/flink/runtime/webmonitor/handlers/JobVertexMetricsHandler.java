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

package org.apache.flink.runtime.webmonitor.handlers;

import com.fasterxml.jackson.core.JsonGenerator;
import org.apache.flink.runtime.instance.ActorGateway;

import java.io.StringWriter;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Random;

/**
 * Handler listing the metrics available for the given vertex
 */
public class JobVertexMetricsHandler implements RequestHandler {


	/**	private enum MetricType {
		COUNTER, // showing current value
		METER, // total, one minute,, per 5 mins, per 15 mins, mean
		GAUGE, // latency, cpu
		TIMER, // not used: call frequency, rates for duration
		HISTOGRAM
	} **/
	private static final Random RND = new Random();


	private static class Metric {
		String name;
		String id;
		long v;

		public Metric(String name, String id) {
			this.name = name;
			this.id = id;
		}

		// fake it till you make it
		public String getNext() {
			if(id.startsWith("elements-per")) {
				v = 50000 - RND.nextInt(50000);
			} else if(id.startsWith("elements-")) {
				v += RND.nextInt(500);
			} else if(id.startsWith("bytes-per")) {
				v = 8000000 - RND.nextInt(8000000);
			} else if(id.startsWith("bytes-")) {
				v += RND.nextInt(100000);
			} else if(id.startsWith("late-arrivals")) {
				if(RND.nextInt(10) == 0) {
					v += 1;
				}
			} else {
				throw new RuntimeException("Unhandled id " + id);
			}

			return Long.toString(v);
		}
	}

	static List<Metric> metricList = new ArrayList<>();
	static {
		metricList.add(new Metric("# elements in", "elements-in"));
		metricList.add(new Metric("bytes in", "bytes-in"));
		metricList.add(new Metric("# elements in", "elements-out"));
		metricList.add(new Metric("bytes out", "bytes-out"));

		metricList.add(new Metric("# elements / second in", "elements-per-second-in"));
		metricList.add(new Metric("bytes / second in", "bytes-per-second-out"));

		metricList.add(new Metric("# elements / second out", "elements-per-second-out"));
		metricList.add(new Metric("bytes / second out", "bytes-per-second-out"));

		metricList.add(new Metric("Windows: late arrivals", "late-arrivals"));
	}


	@Override
	public String handleRequest(Map<String, String> pathParams, Map<String, String> queryParams, ActorGateway jobManager) throws Exception {
	//	System.out.println("Params : " + queryParams);

		StringWriter writer = new StringWriter();
		JsonGenerator gen = JsonFactory.jacksonFactory.createGenerator(writer);

		if(queryParams.containsKey("get")) {
			gen.writeStartArray();
			// we return the requested metrics
			String list = queryParams.get("get");
			String[] elements = list.split(",");
			for(String element: elements) {
				// do a stupid list search
				for(Metric m: metricList) {
					if(m.id.equals(element)) {
						gen.writeStartObject();
						gen.writeStringField("id", element);
						gen.writeStringField("value", m.getNext());
						gen.writeEndObject();
					}
				}
			}
			gen.writeEndArray();
			gen.close();
			return writer.toString();
		} else {
			// no argument was given. We list the available metrics
			gen.writeStartObject();
			gen.writeArrayFieldStart("available");
			for(Metric m: metricList) {
				gen.writeStartObject();
				gen.writeStringField("name", m.name);
				gen.writeStringField("id", m.id);
				gen.writeEndObject();
			}

			gen.writeEndArray();
			gen.writeEndObject();

			gen.close();
			return writer.toString();
		}
	}
}
