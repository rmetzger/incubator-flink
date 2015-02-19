package org.apache.flink.runtime.metrics;

import com.codahale.metrics.Counter;
import com.codahale.metrics.Gauge;
import com.codahale.metrics.Metric;
import com.codahale.metrics.MetricFilter;
import com.codahale.metrics.MetricRegistry;
import com.codahale.metrics.MetricSet;
import com.codahale.metrics.json.MetricsModule;
import com.codahale.metrics.jvm.GarbageCollectorMetricSet;
import com.codahale.metrics.jvm.MemoryUsageGaugeSet;
import com.esotericsoftware.kryo.Kryo;
import com.esotericsoftware.kryo.io.Input;
import com.esotericsoftware.kryo.io.Output;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;

import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.io.Serializable;
import java.util.HashMap;
import java.util.Map;
import java.util.SortedMap;
import java.util.concurrent.TimeUnit;

public class SerializableMetricsReporter {

	public static MetricsReport getReport(MetricRegistry registry) {
		MetricsReport report = new MetricsReport();

		SortedMap<String, Counter> counters = registry.getCounters();

		report.values = new HashMap<String, Object>(counters.size());
		for(Map.Entry<String, Counter> entry : counters.entrySet()) {
			report.values.put(entry.getKey(), entry.getValue().getCount());
		}
		for(Map.Entry<String, Gauge> entry: registry.getGauges().entrySet()) {
			report.values.put(entry.getKey(), entry.getValue().getValue());
		}
		if(registry.getHistograms().size() > 0 || registry.getMeters().size() > 0 || registry.getTimers().size() > 0) {
			throw new RuntimeException("Implement me");
		}

		return report;
	}

	//-----------------------------------------------------------------------

	/**
	 * Return serialized representation of the registry for sending it over
	 * the wire.
	 * @return
	 */
	private static Kryo kryo;
	public static byte[] serialize(MetricsReport report) {
		if(kryo == null) {
			kryo = new Kryo();
			kryo.register(MetricsReport.class);
			kryo.register(HashMap.class);
			kryo.setRegistrationRequired(true);
		}
		ByteArrayOutputStream baos = new ByteArrayOutputStream();
		Output out = new Output(baos);
		kryo.writeClassAndObject(out, report);
		out.flush();
		return baos.toByteArray();
	}

	public static MetricsReport deserialize(byte[] ser) {
		ByteArrayInputStream bais = new ByteArrayInputStream(ser);
		Input in = new Input(bais);
		return (MetricsReport) kryo.readClassAndObject(in);
	}




	//-----------------------------------------------------------------------

	public static void main(String[] args) throws JsonProcessingException {
		MetricRegistry mr = new MetricRegistry();
		mr.register("gc", new GarbageCollectorMetricSet());
		mr.register("memory", new MemoryUsageGaugeSet());
		mr.counter("ab").inc();
		MetricsReport report = SerializableMetricsReporter.getReport(mr);
		byte[] ser = SerializableMetricsReporter.serialize(report);
		System.out.printf("ser.length"+ser.length);
		MetricsReport newRep = SerializableMetricsReporter.deserialize(ser);
		System.out.println("ser-de rep "+newRep);
		MetricRegistry centralRepository = new MetricRegistry();
		centralRepository.registerAll(newRep);

		ObjectMapper metricRegistryMapper = new ObjectMapper().registerModule(new MetricsModule(TimeUnit.SECONDS, TimeUnit.MILLISECONDS, false, MetricFilter.ALL));

		String s = metricRegistryMapper.writeValueAsString(centralRepository);
		System.out.println("centralRepo = "+centralRepository+"s = "+s);
	}


	public static class MetricsReport implements Serializable, MetricSet {
		private Map<String, Object> values;

		public Map<String, Object> getValues() {
			return values;
		}

		@Override
		public String toString() {
			return "MetricsReport{" +
					"counters=" + values +
					'}';
		}

		//-----------------------------------------------------------------------
		// Allow exporting the MetricsReport to metric repositories
		@Override
		public Map<String, Metric> getMetrics() {
			Map<String, Metric> ret = new HashMap<String, Metric>(values.size());
			for(Map.Entry<String, Object> value : values.entrySet()) {
				ret.put(value.getKey(), new GaugeHelper(value));
			}
			return ret;
		}

		public static class GaugeHelper implements Gauge {
			private final Object o;
			GaugeHelper(Object o) {
				this.o = o;
			}
			@Override
			public Object getValue() {
				return this.o;
			}
		}
	}
}
