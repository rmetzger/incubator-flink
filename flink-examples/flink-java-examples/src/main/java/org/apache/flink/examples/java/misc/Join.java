package org.apache.flink.examples.java.misc;

import org.apache.flink.api.common.functions.FlatMapFunction;
import org.apache.flink.api.common.functions.MapFunction;
import org.apache.flink.api.common.functions.RichGroupReduceFunction;
import org.apache.flink.api.java.DataSet;
import org.apache.flink.api.java.ExecutionEnvironment;
import org.apache.flink.api.java.aggregation.Aggregations;
import org.apache.flink.api.java.functions.FunctionAnnotation;
import org.apache.flink.api.java.operators.AggregateOperator;
import org.apache.flink.api.java.operators.GroupReduceOperator;
import org.apache.flink.api.java.operators.JoinOperator;
import org.apache.flink.api.java.tuple.Tuple2;
import org.apache.flink.util.Collector;

import java.util.Arrays;

public class Join {

	public static void main(String[] args) throws Exception {
		one();
	//	two();
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
}
