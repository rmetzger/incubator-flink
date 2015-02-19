package org.apache.flink.runtime.metrics;

import com.codahale.metrics.Counter;
import com.codahale.metrics.MetricRegistry;

public class TaskMetrics {
	private final MetricRegistry registry;
	private final Counter incomingRecords;
	private final Counter incomingBroadcastRecords;
	private final Counter outgoingRecords;

	public TaskMetrics(MetricRegistry registry) {
		this.registry = registry;
		this.incomingRecords = this.registry.counter("record.incomings");
		this.incomingBroadcastRecords = this.registry.counter("record.broadcast.incomings");
		this.outgoingRecords = this.registry.counter("record.outgoings");
	}

	public Counter getIncomingRecordsCounter() {
		return incomingRecords;
	}

	public Counter getIncomingBroadcastRecordsCounter() {
		return incomingBroadcastRecords;
	}

	public Counter getOutgoingRecordsCounter() {
		return outgoingRecords;
	}

	public void incomingRecord() {
		incomingRecords.inc();
	}

	public void outgoingRecord() {
		outgoingRecords.inc();
	}
}
