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

package org.apache.flink.hadoopcompatibility;

// we include the shaded dependency here. Its only internal. (org.apache.flink.hadoop.shaded.
import org.apache.flink.api.java.utils.ParameterTool;
import org.apache.hadoop.util.GenericOptionsParser;

import java.io.IOException;
import java.lang.reflect.InvocationTargetException;
import java.lang.reflect.Method;
import java.util.HashMap;
import java.util.Map;

/**
 * Utility class to work with Apache Hadoop libraries.
 */
public class HadoopUtils {
	/**
	 * Returns {@link ParameterTool} for the arguments parsed by {@link GenericOptionsParser}
	 *
	 * @param args Input array arguments. It should be parsable by {@link GenericOptionsParser}
	 * @return A {@link ParameterTool}
	 * @throws IOException If arguments cannot be parsed by {@link GenericOptionsParser}
	 * @see GenericOptionsParser
	 */
	public static ParameterTool paramsFromGenericOptionsParser(String[] args) throws IOException {
		Object[] options = new GenericOptionsParser(args).getCommandLine().getOptions();
		if(options.length == 0) {
			return ParameterTool.fromMap(new HashMap<String, String>());
		}
		try {
			Method method = options[0].getClass().getMethod("getValue");
			Map<String, String> map = new HashMap<String, String>();
			for (Object option : options) {
				String val = (String)method.invoke(option);
				String[] split = val.split("=");
				map.put(split[0], split[1]);
			}
			return ParameterTool.fromMap(map);
		} catch(NoSuchMethodException | IllegalAccessException | InvocationTargetException e) {
			throw new RuntimeException("Missing commons-cli dependency in runtime classpath", e);
		}
	}
}


