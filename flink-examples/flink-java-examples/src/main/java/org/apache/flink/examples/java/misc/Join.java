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

package org.apache.flink.examples.java.misc;

import org.apache.flink.api.common.functions.MapFunction;
import org.apache.flink.api.common.functions.RichGroupReduceFunction;
import org.apache.flink.api.common.io.DefaultInputSplitAssigner;
import org.apache.flink.api.common.io.InputFormat;
import org.apache.flink.api.common.io.statistics.BaseStatistics;
import org.apache.flink.api.java.DataSet;
import org.apache.flink.api.java.ExecutionEnvironment;
import org.apache.flink.api.java.tuple.Tuple2;
import org.apache.flink.configuration.Configuration;
import org.apache.flink.core.io.InputSplit;
import org.apache.flink.core.io.InputSplitAssigner;
import org.apache.flink.core.memory.DataInputView;
import org.apache.flink.core.memory.DataOutputView;
import org.apache.flink.util.Collector;

import java.io.BufferedReader;
import java.io.FileReader;
import java.io.IOException;
import java.util.Arrays;

public class Join {

	public static void main(String[] args) throws Exception {
	//	one();
	//	two();
		//three();
	}
	private static void one() throws Exception {
		ExecutionEnvironment ee = ExecutionEnvironment.getExecutionEnvironment();

		DataSet<Tuple2<Integer, String>> ds1 = ee.readTextFile("/home/robert/incubator-flink/README.md").setHashPartitionKeys(Arrays.asList(0)).map(new MapFunction<String, Tuple2<Integer, String>>() {
			@Override
			public Tuple2<Integer, String> map(String value) throws Exception {
				return new Tuple2<Integer, String>(1, value);
			}
		}).withConstantSet("0");

		DataSet<Tuple2<Integer, String>> ds2 = ee.readTextFile("/home/robert/incubator-flink/NOTICE").setHashPartitionKeys(Arrays.asList(0)).map(new MapFunction<String, Tuple2<Integer, String>>() {
			@Override
			public Tuple2<Integer, String> map(String value) throws Exception {
				return new Tuple2<Integer, String>(1, value);
			}
		}).withConstantSet("0");

		DataSet<Tuple2<Tuple2<Integer, String>, Tuple2<Integer, String>>> join = ds1.join(ds2).where(0).equalTo(0);

		join.print();
		System.out.println("Plan : " + ee.getExecutionPlan());
		//	ee.execute();
	}

	private static void three() throws Exception {
		ExecutionEnvironment ee = ExecutionEnvironment.getExecutionEnvironment();

		DistributedLocalInputFormat clusterLocalInput = new DistributedLocalInputFormat();
		DataSet<Tuple2<Integer, String>> ds1 = ee.createInput(clusterLocalInput).setHashPartitionKeys(Arrays.asList(0)).map(new MapFunction<String, Tuple2<Integer, String>>() {
			@Override
			public Tuple2<Integer, String> map(String value) throws Exception {
				return new Tuple2<Integer, String>(1, value);
			}
		}).withConstantSet("0");

		DataSet<Tuple2<Integer, String>> ds2 = ee.readTextFile("/home/robert/incubator-flink/NOTICE").setHashPartitionKeys(Arrays.asList(0)).map(new MapFunction<String, Tuple2<Integer, String>>() {
			@Override
			public Tuple2<Integer, String> map(String value) throws Exception {
				return new Tuple2<Integer, String>(1, value);
			}
		}).withConstantSet("0");

		DataSet<Tuple2<Tuple2<Integer, String>, Tuple2<Integer, String>>> join = ds1.join(ds2).where(0).equalTo(0);

		join.print();
		System.out.println("Plan : " + ee.getExecutionPlan());
		//	ee.execute();
	}

	private static void two() throws Exception {
		ExecutionEnvironment ee = ExecutionEnvironment.getExecutionEnvironment();

		DataSet<Tuple2<Integer, Integer>> ds1 = ee.readCsvFile("ab").fieldDelimiter('|').types(Integer.class, Integer.class).setHashPartitionKeys(Arrays.asList(0));
		DataSet<Integer> a = ds1.groupBy(0).reduceGroup(new RichGroupReduceFunction<Tuple2<Integer,Integer>, Integer>() {
			@Override
			public void reduce(Iterable<Tuple2<Integer, Integer>> values, Collector<Integer> out) throws Exception {
				for(Tuple2<Integer, Integer> value : values ){
					out.collect(value.f0);
				}
			}
		});

		a.print();
		System.out.println("Plan : " + ee.getExecutionPlan());
		//ee.execute();
	}

	public static class DummyInputSplit implements InputSplit {

		@Override
		public int getSplitNumber() {
			return 0;
		}

		@Override
		public void write(DataOutputView out) throws IOException {

		}

		@Override
		public void read(DataInputView in) throws IOException {

		}
	}

	/**
	 * Test
	 * 	 DistributedLocalInputFormat in = new DistributedLocalInputFormat();
		 in.setNumNodes(2);
		 in.setInputPath("/home/robert/incubator-flink/README.md");
		 DummyInputSplit[] sp = in.createInputSplits(1);
		 for(DummyInputSplit s: sp) {
		 System.out.println("Opening split "+s);
		 in.open(s);
		 while(!in.reachedEnd() ) {
		 System.out.println("el = " + in.nextRecord(null));
		 }
		 }
	 */
	public static class DistributedLocalInputFormat implements InputFormat<String, DummyInputSplit>{

		private String inputPath;
		private int numNodes = -1;

		public void setInputPath(String inputPath) {
			this.inputPath = inputPath;
		}

		public void setNumNodes(int numNodes) {
			this.numNodes = numNodes;
		}

		@Override
		public void configure(Configuration parameters) {

		}

		@Override
		public BaseStatistics getStatistics(BaseStatistics cachedStatistics) throws IOException {
			return null;
		}

		/**
		 * There are no input splits to create
		 */
		@Override
		public DummyInputSplit[] createInputSplits(int minNumSplits) throws IOException {
			if(numNodes <= 0) {
				throw new IllegalArgumentException("The DistributedLocalInputFormat expects at least one node. " +
						"Please set the number of nodes");
			}
			DummyInputSplit dis[] = new DummyInputSplit[numNodes];
			for(DummyInputSplit d : dis) {
				d = new DummyInputSplit();
			}
			return dis;
		}

		@Override
		public InputSplitAssigner getInputSplitAssigner(DummyInputSplit[] inputSplits) {
			return new DefaultInputSplitAssigner(inputSplits);
		}

		private BufferedReader br;
		private String next = null;
		private boolean reachedEnd = false;
		@Override
		public void open(DummyInputSplit split) throws IOException {
			br = new BufferedReader(new FileReader(inputPath));
			reachedEnd = false;
			next = null;
		}

		private void check() throws IOException {
			if(next == null) {
				String e = br.readLine();
				if (e == null) {
					reachedEnd = true;
				} else {
					next = e;
				}
			}
		}

		@Override
		public boolean reachedEnd() throws IOException {
			check();
			return reachedEnd;
		}

		@Override
		public String nextRecord(String reuse) throws IOException {
			check();
			String e = next;
			next = null;
			return e;
		}

		@Override
		public void close() throws IOException {
			br.close();
		}
	}


}
