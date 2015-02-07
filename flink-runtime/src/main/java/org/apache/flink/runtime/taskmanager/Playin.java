package org.apache.flink.runtime.taskmanager;

import com.codahale.metrics.ConsoleReporter;
import com.codahale.metrics.Counter;
import com.codahale.metrics.JmxReporter;
import com.codahale.metrics.Metric;
import com.codahale.metrics.MetricFilter;
import com.codahale.metrics.MetricRegistry;
import com.codahale.metrics.json.MetricsModule;
import com.codahale.metrics.jvm.GarbageCollectorMetricSet;
import com.codahale.metrics.jvm.MemoryUsageGaugeSet;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.apache.flink.runtime.metrics.MetricsRegistryUtils;
import org.apache.flink.runtime.profiling.types.ThreadProfilingEvent;

import java.lang.management.ManagementFactory;
import java.lang.management.OperatingSystemMXBean;
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

				final ConsoleReporter consoleReporter = ConsoleReporter.forRegistry(mr)
						.convertRatesTo(TimeUnit.SECONDS)
						.convertDurationsTo(TimeUnit.MILLISECONDS)
						.build();
				consoleReporter.start(2, TimeUnit.SECONDS);
				OperatingSystemMXBean osBean = ManagementFactory.getOperatingSystemMXBean();
				try {
					Class<?> classRef = Class.forName("com.sun.management.UnixOperatingSystemMXBean");
					try {
						Object i = classRef.newInstance();
					} catch (InstantiationException e) {
							e.printStackTrace();
					} catch (IllegalAccessException e) {
						e.printStackTrace();
					}
				} catch (ClassNotFoundException e) {
					e.printStackTrace();
				}
				System.out.println("osBean class"+osBean+" osbean class now "+osBean.getClass());

				ObjectMapper mapper = new ObjectMapper().registerModule(
						new MetricsModule(TimeUnit.SECONDS, TimeUnit.MILLISECONDS, false, MetricFilter.ALL));
				try {
					byte[] report = mapper.writeValueAsBytes(mr);
					String rep = new String(report, "utf-8");
					System.out.println("report size "+report.length);
					System.out.println("report "+rep);
					//String s = mapper.writeValueAsString(mr);
					//System.out.println("s = "+s);
				} catch (Throwable e) {
					e.printStackTrace();
				}

			}
		}).start();


		while(true) {
			Counter c = mr.counter("calls");
			c.inc();
			Thread.sleep(50);
		//	byte[] ser = MetricsRegistryUtils.serialize(mr.getMetrics());

		//	Map<String, Metric> deser = MetricsRegistryUtils.deserialize(ser);

		//	System.out.println("ser size "+ser.length+" bytes.");
		}

	}
}
