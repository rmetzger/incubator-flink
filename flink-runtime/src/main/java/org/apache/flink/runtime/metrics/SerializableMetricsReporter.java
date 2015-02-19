package org.apache.flink.runtime.metrics;

import com.codahale.metrics.Counter;
import com.codahale.metrics.MetricRegistry;
import com.codahale.metrics.jvm.GarbageCollectorMetricSet;
import com.codahale.metrics.jvm.MemoryUsageGaugeSet;

import java.io.Serializable;
import java.util.HashMap;
import java.util.Map;
import java.util.SortedMap;

public class SerializableMetricsReporter {
	private final MetricRegistry registry;

	public SerializableMetricsReporter(MetricRegistry mr) {
		this.registry = mr;
	}

	public MetricsReport getReport() {
		MetricsReport report = new MetricsReport();

		SortedMap<String, Counter> counters = this.registry.getCounters();

		report.counters = new HashMap<String, Long>(counters.size());
		for(Map.Entry<String, Counter> entry : counters.entrySet()) {
			report.counters.put(entry.getKey(), entry.getValue().getCount());
		}

		return report;
	}

	public static void main(String[] args) {
		MetricRegistry mr = new MetricRegistry();
		mr.register("gc", new GarbageCollectorMetricSet());
		mr.register("memory", new MemoryUsageGaugeSet());
		mr.counter("ab").inc();
		SerializableMetricsReporter r = new SerializableMetricsReporter(mr);
		MetricsReport report = r.getReport();
	}

	public static class MetricsReport implements Serializable {
		private Map<String, Long> counters;

		public MetricsReport(byte[] incoming) {

		}

		public Map<String, Long> getCounters() {
			return counters;
		}

		public byte[] serialize() {
			return null;
		}
	}
}
