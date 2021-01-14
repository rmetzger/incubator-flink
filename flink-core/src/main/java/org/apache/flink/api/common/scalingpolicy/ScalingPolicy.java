package org.apache.flink.api.common.scalingpolicy;

import org.apache.flink.annotation.PublicEvolving;
import org.apache.flink.api.common.JobStatus;

/**
 * Missing from this interface: - more slots are available, but the policy wants to wait n seconds
 * before triggering a rescale. This draft only allows to scale at a defined point
 */
@PublicEvolving
public interface ScalingPolicy {
    // scheduler reports job status changes
    void reportNewJobStatus(JobStatus newState);

    // periodic call by the scheduler to the policy, to see if a scaling is required
    // method gets called immediately if new slots are available
    void scalingCallback(ScalingPolicyScalingContext context);

    // this method gets initially called by the scheduler for some configurations.
    PolicySchedulerConfiguration getSchedulerConfiguration();

    interface PolicySchedulerConfiguration {
        int getResourceTimeoutSeconds();

        int getScheduleFrequencySeconds();
    }

    interface ScalingPolicyDecisionContext {
        int getNewSlots();

        int getCurrentSlots();

        int getNewCumulativeParallelism();

        int getCurrentCumulativeParallelism();
    }

    interface ScalingPolicyScalingContext extends ScalingPolicyDecisionContext {
        // instruct scheduler to rescale to the provided number of slots.
        void scaleToSlots(int slots);
    }
}
