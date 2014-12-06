package org.apache.flink.runtime.metrics;

import org.apache.flink.metrics.IOMetrics;
import org.apache.flink.metrics.MetricsReport;
import org.apache.flink.metrics.VertexMetrics;
import org.apache.flink.runtime.instance.InstanceID;
import org.apache.flink.runtime.io.disk.iomanager.IOManager;
import org.apache.flink.runtime.jobgraph.JobVertexID;
import org.apache.flink.runtime.messages.TaskManagerMessages;

import java.lang.management.GarbageCollectorMXBean;
import java.lang.management.ManagementFactory;
import java.lang.management.MemoryMXBean;
import java.lang.management.MemoryUsage;
import java.util.List;
import java.util.Map;

public class LocalMetricsServer {

	InstanceID instanceId;
	Map<JobVertexID, VertexMetrics> vertexIDVertexMetricsMap;
	IOManager ioManager;

	public void setInstanceId(InstanceID instanceId) {
		this.instanceId = instanceId;
	}
	public void registerIOManager(IOManager ioManager) {
		this.ioManager = ioManager;
	}

	public MetricsReport sendMetricsToMain() {
		//InstanceMetrics instanceMetrics = new InstanceMetrics();
		MetricsReport report = new MetricsReport();
		IOMetrics iom = ioManager.getIOMetrics();
		iom.addToReport(report);
		addInstanceMetrics(report);
		return report;
	}


	static MemoryMXBean memoryMXBean = ManagementFactory.getMemoryMXBean();
	static List<GarbageCollectorMXBean> gcMXBeans = ManagementFactory.getGarbageCollectorMXBeans();
	private static void addInstanceMetrics(MetricsReport report) {
		// log OS load
		report.addDoubleMetric("os.load", ManagementFactory.getOperatingSystemMXBean().getSystemLoadAverage());

		MemoryUsage heap = memoryMXBean.getHeapMemoryUsage();
		MemoryUsage nonHeap = memoryMXBean.getNonHeapMemoryUsage();

		// heap
		report.addLongMetric("heap.used", heap.getUsed() >> 20 );
		report.addLongMetric("heap.committed", heap.getCommitted() >> 20);
		report.addLongMetric("heap.max", heap.getMax() >> 20);

		// non-heap
		report.addLongMetric("nonHeap.used", nonHeap.getUsed() >> 20 );
		report.addLongMetric("nonHeap.committed", nonHeap.getCommitted() >> 20);
		report.addLongMetric("nonHeap.max", nonHeap.getMax() >> 20);

		// garbage collection beans
		for(GarbageCollectorMXBean bean: gcMXBeans) {
			report.addLongMetric("gc." + bean.getName() + ".count" , bean.getCollectionCount());
			report.addLongMetric("gc." + bean.getName() + ".time", bean.getCollectionTime());
		}

		report.addLongMetric("classloader.loaded", ManagementFactory.getClassLoadingMXBean().getLoadedClassCount());
		report.addLongMetric("classloader.total-loaded", ManagementFactory.getClassLoadingMXBean().getTotalLoadedClassCount());
		report.addLongMetric("classloader.unloaded", ManagementFactory.getClassLoadingMXBean().getUnloadedClassCount());
	}
}
