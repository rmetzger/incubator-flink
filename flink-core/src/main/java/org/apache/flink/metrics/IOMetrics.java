package org.apache.flink.metrics;

public class IOMetrics{
	public long bytesWritten;
	public long bytesRead;

	public void addToReport(MetricsReport report) {
		report.addLongMetric("iomanager.bytesWritten", this.bytesWritten);
		report.addLongMetric("iomanager.bytesRead", this.bytesRead);
	}
}
