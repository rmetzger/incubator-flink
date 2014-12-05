package org.apache.flink.metrics;

public class VertexMetrics extends Metrics<VertexMetrics> {

	public int inputSplits;

	public int localizedInputSplits;

	@Override
	public void merge(VertexMetrics otherMetrics) {

	}
}
