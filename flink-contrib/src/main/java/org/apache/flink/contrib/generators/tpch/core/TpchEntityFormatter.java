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
package org.apache.flink.contrib.generators.tpch.core;

import io.airlift.tpch.TpchEntity;
import org.apache.flink.api.java.io.TextOutputFormat;
import org.apache.flink.api.java.tuple.Tuple;

/**
 * This formatter is using TpchEntry.toLine() instead of toString().
 * @param <T>
 */
public class TpchEntityFormatter<T> implements TextOutputFormat.TextFormatter<T> {

	@Override
	public String format(T value) {
		return _format(value);
	}

	private static String _format(Object e) {
		if(e instanceof Tuple) {
			Tuple t = (Tuple) e;
			StringBuilder r = new StringBuilder();
			r.append("Tuple");
			r.append(t.getArity());
			r.append("(");
			for(int i = 0; i < t.getArity(); i++) {
				r.append(_format(t.getField(i)));
				r.append(", ");
			}
			r.append(")");
			return r.toString();
		} else if(e instanceof TpchEntity) {
			return ((TpchEntity) e).toLine();
		} else {
			return e.toString();
		}
	}
}
