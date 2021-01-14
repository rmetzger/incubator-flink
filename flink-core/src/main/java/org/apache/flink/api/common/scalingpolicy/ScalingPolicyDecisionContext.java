package org.apache.flink.api.common.scalingpolicy;

public interface ScalingPolicyDecisionContext {
    int getNewAvailableSlots();
}
