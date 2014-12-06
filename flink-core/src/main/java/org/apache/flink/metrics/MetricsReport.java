package org.apache.flink.metrics;

import java.util.HashMap;
import java.util.Map;

/**
* Created by robert on 12/6/14.
*/
public class MetricsReport {
	Map<String, Object> metrics = new HashMap<String, Object>();
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
