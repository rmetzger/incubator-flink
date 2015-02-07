package org.apache.flink.runtime.metrics;

import com.codahale.metrics.Counter;
import com.codahale.metrics.Histogram;
import com.codahale.metrics.Meter;
import com.codahale.metrics.Metric;
import com.codahale.metrics.MetricFilter;
import com.codahale.metrics.MetricRegistry;
import com.codahale.metrics.MetricSet;
import com.codahale.metrics.Timer;

import java.util.Map;

public class SerializableMetricsRegistry extends MetricRegistry {
	final String prefix;

	public SerializableMetricsRegistry(String prefix) {
		this.prefix = prefix;
	}

	/**
	 * Return serialized representation of the registry for sending it over
	 * the wire.
	 * @return
	 */
	public byte[] getSerialized() {
		return null;
	}
	@Override
	public <T extends Metric> T register(String name, T metric) throws IllegalArgumentException {
		return super.register(this.prefix + name, metric);
	}

	@Override
	public void registerAll(MetricSet metrics) throws IllegalArgumentException {
		registerAll(this.prefix, metrics);
	}

	// copied method.
	private void registerAll(String prefix, MetricSet metrics) throws IllegalArgumentException {
		for (Map.Entry<String, Metric> entry : metrics.getMetrics().entrySet()) {
			if (entry.getValue() instanceof MetricSet) {
				registerAll(name(prefix, entry.getKey()), (MetricSet) entry.getValue());
			} else {
				register(name(prefix, entry.getKey()), entry.getValue());
			}
		}
	}


	@Override
	public Counter counter(String name) {
		return super.counter(this.prefix + name);
	}

	@Override
	public Histogram histogram(String name) {
		return super.histogram(this.prefix + name);
	}

	@Override
	public Meter meter(String name) {
		return super.meter(this.prefix + name);
	}

	@Override
	public Timer timer(String name) {
		return super.timer(this.prefix + name);
	}

	@Override
	public boolean remove(String name) {
		return super.remove(this.prefix + name);
	}

	@Override
	public void removeMatching(final MetricFilter filter) {
		// delegate with prefix
		super.removeMatching(new MetricFilter() {
			@Override
			public boolean matches(String name, Metric metric) {
				return filter.matches(prefix + name, metric);
			}
		});
	}

}
