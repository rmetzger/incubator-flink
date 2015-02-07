package org.apache.flink.runtime.taskmanager;

import com.codahale.metrics.ConsoleReporter;
import com.codahale.metrics.Counter;
import com.codahale.metrics.JmxAttributeGauge;
import com.codahale.metrics.JmxReporter;
import com.codahale.metrics.MetricRegistry;
import com.codahale.metrics.jvm.GarbageCollectorMetricSet;
import com.codahale.metrics.jvm.MemoryUsageGaugeSet;
import org.apache.flink.runtime.metrics.SerializableMetricsRegistry;

import java.util.concurrent.TimeUnit;

public class Playin {

	public static void main(String[] args) throws InterruptedException {
		final MetricRegistry mr = new SerializableMetricsRegistry("taskmanager.cloud-18.");
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
			}
		}).start();

		while(true) {
			Counter c = mr.counter("calls");
			c.inc();
			Thread.sleep(50);
		}

	}
}
