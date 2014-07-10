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

import java.util.Collection;
import java.util.HashSet;
import java.util.List;

import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;

import eu.stratosphere.api.java.tuple.Tuple;
import eu.stratosphere.pact.runtime.plugable.SerializationDelegate;
import eu.stratosphere.runtime.io.api.RecordWriter;
import eu.stratosphere.streaming.api.streamcomponent.AbstractCollector;
import eu.stratosphere.streaming.api.streamcomponent.NotPartitionedCollector;
import eu.stratosphere.streaming.api.streamcomponent.PartitionedCollector;
import eu.stratosphere.streaming.util.LogUtils;
import eu.stratosphere.util.Collector;

public class StreamCollectorManager<T extends Tuple> implements Collector<T> {

	protected static final Log log = LogFactory.getLog(StreamCollectorManager.class);
	Collection<AbstractCollector<Tuple>> collectors;
	int keyPosition;

	// TODO consider channelID
	public StreamCollectorManager(List<Integer> batchSizesOfNotPartitioned,
			List<Integer> batchSizesOfPartitioned, List<Integer> parallelismOfOutput,
			int keyPosition, long batchTimeout, int channelID,
			SerializationDelegate<Tuple> serializationDelegate,
			List<RecordWriter<StreamRecord>> partitionedOutputs,
			List<RecordWriter<StreamRecord>> notPartitionedOutputs) {
		
		this.keyPosition = keyPosition;

		collectors = new HashSet<AbstractCollector<Tuple>>();

		for (int i = 0; i < batchSizesOfPartitioned.size(); i++) {
			@SuppressWarnings("unchecked")
			StreamCollector<Tuple>[] collector = new StreamCollector[parallelismOfOutput.get(i)];
			for (int j = 0; j < collector.length; j++) {
				collector[j] = new StreamCollector<Tuple>(batchSizesOfPartitioned.get(i),
						batchTimeout, channelID, serializationDelegate, partitionedOutputs.get(i));
			}
			addPartitionedCollector(collector);
		}

		for (int i = 0; i < batchSizesOfNotPartitioned.size(); i++) {
			addNotPartitionedCollector(new StreamCollector<Tuple>(
					batchSizesOfNotPartitioned.get(i), batchTimeout, channelID,
					serializationDelegate, notPartitionedOutputs.get(i)));
		}
	}

	protected PartitionedCollector<Tuple> addPartitionedCollector(StreamCollector<Tuple>[] collector) {
		PartitionedCollector<Tuple> partitionedCollector = new PartitionedCollector<Tuple>(collector);
		collectors.add(partitionedCollector);
		return partitionedCollector;
	}

	protected NotPartitionedCollector<Tuple> addNotPartitionedCollector(StreamCollector<Tuple> collector) {
		NotPartitionedCollector<Tuple> notPartitionedCollector = new NotPartitionedCollector<Tuple>(collector);
		collectors.add(new NotPartitionedCollector<Tuple>(collector));
		return notPartitionedCollector;
	}

	@Override
	public void collect(T tuple) {
		T copiedTuple = StreamRecord.copyTuple(tuple);

		int partitionHash = Math.abs(copiedTuple.getField(keyPosition).hashCode());

		for (AbstractCollector<Tuple> collector : collectors) {
			collector.collect(copiedTuple, partitionHash);
		}
	}

	@Override
	public void close() {
	}
}
