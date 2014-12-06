package org.apache.flink.metrics;


import java.util.HashMap;
import java.util.Map;

public class InstanceMetrics extends Metrics<InstanceMetrics> {

	public Map<String, Metrics> metricsMap = new HashMap<String, Metrics>();

	public void merge(InstanceMetrics otherMetrics) {

	}
}
