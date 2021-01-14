package org.apache.flink.runtime.scheduler.declarative;

import org.apache.flink.api.common.scalingpolicy.ScalingPolicyDecisionContext;

public class ScalingPolicyDecisionContextImpl implements ScalingPolicyDecisionContext {
    // this requires JobVertexID to be available in flink-core
    // private final Map<JobVertexID, Integer> currentVertexAssignment;
    // private final Map<JobVertexID, Integer> newVertexAssignment;
    private final int newAvailableSlots;
    private final int allocatedSlots;
    private final int newCumulativeParallelism;
    private final int currentCumulativeParallelism;

    public ScalingPolicyDecisionContextImpl(int newAvailableSlots) {
        this.newAvailableSlots = newAvailableSlots;
    }

    @Override
    public int getNewAvailableSlots() {
        return newAvailableSlots;
    }
}
