package org.apache.flink.runtime.yarn;

import java.io.Serializable;


public class FlinkYarnClusterStatus implements Serializable {
	private int numberOfTaskManagers;
	private int numberOfSlots;

	public FlinkYarnClusterStatus() {
	}

	public FlinkYarnClusterStatus(int numberOfTaskManagers, int numberOfSlots) {
		this.numberOfTaskManagers = numberOfTaskManagers;
		this.numberOfSlots = numberOfSlots;
	}

	public int getNumberOfTaskManagers() {
		return numberOfTaskManagers;
	}

	public void setNumberOfTaskManagers(int numberOfTaskManagers) {
		this.numberOfTaskManagers = numberOfTaskManagers;
	}

	public int getNumberOfSlots() {
		return numberOfSlots;
	}

	public void setNumberOfSlots(int numberOfSlots) {
		this.numberOfSlots = numberOfSlots;
	}
}
