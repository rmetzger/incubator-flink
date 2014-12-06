package org.apache.flink.metrics;

import java.io.Serializable;
import java.util.HashMap;
import java.util.Map;

public class MetricsReport implements Serializable {
	private Map<String, Object> metrics = new HashMap<String, Object>();
	public void addLongMetric(String name, long value) {
		this.metrics.put(name, value);
	}
	public void addIntMetric(String name, int value) {
		this.metrics.put(name, value);
	}
	public void addDoubleMetric(String s, double value) {
		this.metrics.put(s, value);
	}

	public Map<String, Object> getMetricsMap() {
		return metrics;
	}

}
