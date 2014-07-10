/***********************************************************************************************************************
 *
 * Copyright (C) 2010-2014 by the Stratosphere project (http://stratosphere.eu)
 *
 * Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with
 * the License. You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on
 * an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the
 * specific language governing permissions and limitations under the License.
 *
 **********************************************************************************************************************/
package eu.stratosphere.streaming.api.streamrecord;

import java.util.HashMap;
import java.util.HashSet;
import java.util.List;

import eu.stratosphere.api.java.tuple.Tuple;
import eu.stratosphere.pact.runtime.plugable.SerializationDelegate;
import eu.stratosphere.runtime.io.api.RecordWriter;
import eu.stratosphere.streaming.api.streamcomponent.AbstractCollector;
import eu.stratosphere.util.Collector;

public class DirectedStreamCollectorManager<T extends Tuple> extends StreamCollectorManager<T> {

	OutputSelector<T> outputSelector;
	HashMap<String, AbstractCollector<Tuple>> outputNameMap;

	public DirectedStreamCollectorManager(List<Integer> batchSizesOfNotPartitioned,
			List<Integer> batchSizesOfPartitioned, List<Integer> parallelismOfOutput,
			int keyPosition, long batchTimeout, int channelID,
			SerializationDelegate<Tuple> serializationDelegate,
			List<RecordWriter<StreamRecord>> partitionedOutputs,
			List<RecordWriter<StreamRecord>> notPartitionedOutputs,
			OutputSelector<T> outputSelector, List<String> partitionedOutputNames,
			List<String> notPartitionedOutputNames) {
		super(batchSizesOfNotPartitioned, batchSizesOfPartitioned, parallelismOfOutput,
				keyPosition, batchTimeout, channelID, serializationDelegate, partitionedOutputs,
				notPartitionedOutputs);

		this.outputSelector = outputSelector;
		this.outputNameMap = new HashMap<String, AbstractCollector<Tuple>>();

		// TODO init outputNameMap
		for (int i = 0; i < batchSizesOfPartitioned.size(); i++) {
			@SuppressWarnings("unchecked")
			StreamCollector<Tuple>[] collectors = new StreamCollector[parallelismOfOutput.get(i)];
			for (int j = 0; j < collectors.length; j++) {
				collectors[j] = new StreamCollector<Tuple>(batchSizesOfPartitioned.get(i),
						batchTimeout, channelID, serializationDelegate, partitionedOutputs.get(i));
			}
			addPartitionedCollector(collectors, partitionedOutputNames.get(i));
		}

		for (int i = 0; i < batchSizesOfNotPartitioned.size(); i++) {
			StreamCollector<Tuple> collector = new StreamCollector<Tuple>(
					batchSizesOfNotPartitioned.get(i), batchTimeout, channelID,
					serializationDelegate, notPartitionedOutputs.get(i));
			addNotPartitionedCollector(collector, notPartitionedOutputNames.get(i));
		}
	}

	protected void addPartitionedCollector(StreamCollector<Tuple>[] collector, String outputName) {
		outputNameMap.put(outputName, addPartitionedCollector(collector));
	}

	protected void addNotPartitionedCollector(StreamCollector<Tuple> collector, String outputName) {
		outputNameMap.put(outputName, addNotPartitionedCollector(collector));
	}

	// TODO make this method faster
	@Override
	public void collect(T tuple) {
		T copiedTuple = StreamRecord.copyTuple(tuple);

		List<String> outputs = (List<String>) outputSelector.getOutputs(tuple);

		int partitionHash = Math.abs(copiedTuple.getField(keyPosition).hashCode());

		for (String outputName : outputs) {
			AbstractCollector<Tuple> output = outputNameMap.get(outputName);
			if (output != null) {
				output.collect(copiedTuple, partitionHash);
			} else {
				if (log.isErrorEnabled()) {
					log.error("Undefined output name given by OutputSelector (" + outputName
							+ "), collecting is omitted.");
				}
			}
		}

		outputSelector.clearList();
	}
}
