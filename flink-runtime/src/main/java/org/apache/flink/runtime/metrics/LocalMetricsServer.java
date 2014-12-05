package org.apache.flink.runtime.metrics;

import org.apache.flink.runtime.instance.InstanceID;
import org.apache.flink.runtime.messages.TaskManagerMessages;

/**
 * Created by robert on 12/5/14.
 */
public class LocalMetricsServer {

	InstanceID instanceId;

	public void setInstanceId(InstanceID instanceId) {
		this.instanceId = instanceId;
	}

	public TaskManagerMessages.MetricsReport sendMetricsToMain() {
		TaskManagerMessages.MetricsReport report = new TaskManagerMessages.MetricsReport(null, null);
		return report;
	}
}
