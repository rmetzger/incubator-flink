/**
 * Licensed to the Apache Software Foundation (ASF) under one or more contributor license agreements. See the NOTICE
 * file distributed with this work for additional information regarding copyright ownership. The ASF licenses this file
 * to You under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the
 * License. You may obtain a copy of the License at
 * 
 * http://www.apache.org/licenses/LICENSE-2.0
 * 
 * Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on
 * an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the
 * specific language governing permissions and limitations under the License.
 */
package org.apache.flink.streaming.connectors;

import org.apache.kafka.copied.common.Node;
import org.apache.kafka.copied.common.PartitionInfo;

import java.io.Serializable;

/**
 * Information about a topic-partition.
 */
public class FlinkPartitionInfo implements Serializable {

    private final String topic;
    private final int partition;
    private final Node leader;

    public FlinkPartitionInfo(String topic, int partition, Node leader) {
        this.topic = topic;
        this.partition = partition;
        this.leader = leader;
    }

    public FlinkPartitionInfo(PartitionInfo partitionInfo) {
        this.topic = partitionInfo.topic();
        this.partition = partitionInfo.partition();
        this.leader = partitionInfo.leader();
    }

    /**
     * The topic name
     */
    public String topic() {
        return topic;
    }

    /**
     * The partition id
     */
    public int partition() {
        return partition;
    }

    /**
     * The node id of the node currently acting as a leader for this partition or -1 if there is no leader
     */
    public Node leader() {
        return leader;
    }


    @Override
    public String toString() {
        return String.format("Partition(topic = %s, partition = %d, leader = %s",
                topic,
                partition,
                leader == null ? "none" : leader.id());
    }
}
