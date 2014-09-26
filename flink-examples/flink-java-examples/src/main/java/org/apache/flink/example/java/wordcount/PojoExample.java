/**
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


package org.apache.flink.example.java.wordcount;

import org.apache.flink.api.common.functions.FlatMapFunction;
import org.apache.flink.api.common.functions.ReduceFunction;
import org.apache.flink.api.java.DataSet;
import org.apache.flink.api.java.ExecutionEnvironment;
import org.apache.flink.api.java.functions.KeySelector;
import org.apache.flink.api.java.tuple.Tuple2;
import org.apache.flink.examples.java.wordcount.util.WordCountData;
import org.apache.flink.util.Collector;


/*
 * TODO LIST:
 * - check for correct configuration of serializer
 * 
 * - add support for using methods instead of fields. (check if field is public!)
 * - keyselectors for aggregation methods?
 * - for using the codegen method, fields have to be public 
 * 
 * - Little benchmark: codegen (handmade) vs reflection
 *
 **/



public class PojoExample {
	
	public static class WordFreq {
		char firstLetter;
		String restOfWord;
		Integer freq;
		public WordFreq() {
			freq = 0;
		}
		public WordFreq(char f, String restOfWord, int i) {
			this.firstLetter = f;
			this.restOfWord = restOfWord;
			this.freq = i;
		}
		public String getMeTheKey() {
			return firstLetter+restOfWord;
		}
		@Override
		public String toString() {
			return "WordFreq. word="+getMeTheKey()+" freq="+freq;
		}
		
	}
	
	// *************************************************************************
	//     PROGRAM
	// *************************************************************************
	
	public static class Tu2<V1, V2> {
		//
	}
	public static class Test {
		public int v1;
		public Tu2<Integer, String> oha;
	}
	public static void main(String[] args) throws Exception {
		Class<?> clazz = Test.class;
		System.err.println("Field Type "+clazz.getField("oha").getType());
		System.err.println("Field Type Generics"+clazz.getField("oha").getGenericType());
		
		System.exit(0);
		
		if(!parseParameters(args)) {
			return;
		}
		
		// set up the execution environment
		final ExecutionEnvironment env = ExecutionEnvironment.getExecutionEnvironment();
		
		// get input data
		DataSet<String> text = getTextDataSet(env);
		
		DataSet<WordFreq> counts = 
				// split up the lines in pairs (2-tuples) containing: (word,1)
				text.flatMap(new Tokenizer())
				// group by the tuple field "0" and sum up tuple field "1"
				.groupBy("firstLetter", "restOfWord", "freq")
				.reduce(new ReduceFunction<PojoExample.WordFreq>() {
					private static final long serialVersionUID = 1L;
					@Override
					public WordFreq reduce(WordFreq value1, WordFreq value2) throws Exception {
						return new WordFreq(value1.firstLetter, value1.restOfWord, value1.freq + value2.freq);
					}
				});
				//.sum("freq");
		DataSet<Integer> joinPartner = env.fromElements(1,2,3);
		DataSet<Tuple2<WordFreq, Integer>> joined = counts.join(joinPartner).where("freq").equalTo(new KeySelector<Integer, Integer>() {
			private static final long serialVersionUID = 1L;

			@Override
			public Integer getKey(Integer value) throws Exception {
				return value;
			}
		});
		// emit result
		if(fileOutput) {
			counts.writeAsCsv(outputPath, "\n", " ");
		} else {
			counts.print();
		}
		
		// execute program
		env.execute("WordCount Example");
	}
	
	// *************************************************************************
	//     USER FUNCTIONS
	// *************************************************************************
	
	/**
	 * Implements the string tokenizer that splits sentences into words as a user-defined
	 * FlatMapFunction. The function takes a line (String) and splits it into 
	 * multiple pairs in the form of "(word,1)" (Tuple2<String, Integer>).
	 */
	public static final class Tokenizer implements FlatMapFunction<String, WordFreq> {

		@Override
		public void flatMap(String value, Collector<WordFreq> out) {
			// normalize and split the line
			String[] tokens = value.toLowerCase().split("\\W+");
			
			// emit the pairs
			for (String token : tokens) {
				if (token.length() > 0) {
					// System.err.println("token: "+token);
					String rest = "";
					if(token.length() > 1) {
						rest = token.substring(1, token.length());
					}
					out.collect(new WordFreq(token.charAt(0), rest, 1));
				}
			}
		}
	}
	
	// *************************************************************************
	//     UTIL METHODS
	// *************************************************************************
	
	private static boolean fileOutput = false;
	private static String textPath;
	private static String outputPath;
	
	private static boolean parseParameters(String[] args) {
		
		if(args.length > 0) {
			// parse input arguments
			fileOutput = true;
			if(args.length == 2) {
				textPath = args[0];
				outputPath = args[1];
			} else {
				System.err.println("Usage: WordCount <text path> <result path>");
				return false;
			}
		} else {
			System.out.println("Executing WordCount example with built-in default data.");
			System.out.println("  Provide parameters to read input data from a file.");
			System.out.println("  Usage: WordCount <text path> <result path>");
		}
		return true;
	}
	
	private static DataSet<String> getTextDataSet(ExecutionEnvironment env) {
		if(fileOutput) {
			// read the text file from given input path
			return env.readTextFile(textPath);
		} else {
			// get default test text data
			return WordCountData.getDefaultTextLineDataSet(env);
		}
	}
}
