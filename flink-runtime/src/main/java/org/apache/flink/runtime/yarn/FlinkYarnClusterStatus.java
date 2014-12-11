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
