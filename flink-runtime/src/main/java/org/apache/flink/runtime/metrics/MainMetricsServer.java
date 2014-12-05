package org.apache.flink.runtime.metrics;



import org.apache.flink.metrics.InstanceMetrics;
import org.apache.flink.metrics.JobMetrics;
import org.apache.flink.metrics.VertexMetrics;
import org.apache.flink.runtime.instance.InstanceID;
import org.apache.flink.runtime.jobgraph.JobID;
import org.apache.flink.runtime.jobgraph.JobVertexID;
import org.apache.flink.util.InstantiationUtil;

import java.util.HashMap;
import java.util.Map;

/**
 * Central server collecting metrics in the system
 *
 * Running on the JobManager
 */

public class MainMetricsServer {
	Map<JobVertexID, VertexMetrics> vertexMetrics = new HashMap<JobVertexID, VertexMetrics>();
	Map<JobID, JobMetrics> jobMetrics = new HashMap<JobID, JobMetrics>();
	Map<InstanceID, InstanceMetrics> instanceMetrics = new HashMap<InstanceID, InstanceMetrics>();

	public Map<InstanceID, InstanceMetrics> getInstanceMetrics() {
		return instanceMetrics;
	}

	public VertexMetrics getVertexMetrics(JobVertexID vertexId) {
		return getTypedMetrics(vertexId, vertexMetrics, VertexMetrics.class);
	}

	public JobMetrics getJobMetrics(JobID job) {
		return getTypedMetrics(job, jobMetrics, JobMetrics.class);
	}

	private static <TYPE, TYPE_METRICS> TYPE_METRICS getTypedMetrics(TYPE type, Map<TYPE, TYPE_METRICS> map, Class<? extends TYPE_METRICS> typeMetricsType) {
		TYPE_METRICS typeMetrics = map.get(type);
		if(typeMetrics == null) {
			typeMetrics = InstantiationUtil.instantiate(typeMetricsType);
			map.put(type, typeMetrics);
		}
		return typeMetrics;
	}
}

