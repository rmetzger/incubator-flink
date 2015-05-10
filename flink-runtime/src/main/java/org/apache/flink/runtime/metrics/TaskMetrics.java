/*
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
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