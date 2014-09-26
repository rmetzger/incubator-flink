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

package org.apache.flink.api.java;

import java.util.HashMap;
import java.util.Map;

import javax.tools.JavaCompiler;
import javax.tools.ToolProvider;

import org.apache.flink.api.common.typeinfo.TypeInformation;
import org.apache.flink.api.java.typeutils.TypeExtractor;
import org.apache.flink.util.InstantiationUtil;
import org.codehaus.janino.JavaSourceClassLoader;
import org.codehaus.janino.util.resource.MapResourceFinder;
import org.codehaus.janino.util.resource.ResourceFinder;

public class JaninoTest {
	
	public static abstract class TestGen {
		protected void initialize() {
			TypeInformation<String> t = TypeExtractor.getForObject(new String("complex test"));
			System.err.println("Arity = "+t.getArity());
		}
		public abstract void doShit();
	}
	
	public static void main(String[] args) throws Exception {
		Map<String, byte[]> map = new HashMap<String, byte[]>();
		String source = ""
				+ "import org.apache.flink.api.java.JaninoTest.TestGen; "
				+ ""
				+ "public class Test extends TestGen {"
				+ "		public void doShit() {"
				+ "			initialize();"
				+ "			System.out.println(\"shit thats cool\");"
				+ "		}"
				+ "}";
		map.put("Test.java", source.getBytes("UTF-8"));
		ClassLoader currentClassLoader = Thread.currentThread().getContextClassLoader();
		ResourceFinder srcFinder = new MapResourceFinder(map);
		JavaSourceClassLoader janinoClassLoader = new JavaSourceClassLoader(currentClassLoader, srcFinder, "UTF-8");
		Class<?> genClass = Class.forName("Test", true, janinoClassLoader);
		TestGen gen = (TestGen) InstantiationUtil.instantiate(genClass);
		gen.doShit();
		
		JavaCompiler compiler = ToolProvider.getSystemJavaCompiler();
		//compiler.run(in, out, err, arguments)
	}
}
