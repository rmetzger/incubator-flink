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
package org.apache.flink.api.java.io;

import org.apache.flink.api.common.typeinfo.TypeInformation;
import org.apache.flink.api.common.typeutils.ComparatorTestBase;
import org.apache.flink.api.common.typeutils.TypeSerializer;
import org.apache.flink.api.java.avro.generated.PersonName;
import org.apache.flink.core.fs.Path;
import org.junit.Assert;
import org.junit.Test;

import java.io.File;
import java.io.IOException;
import java.util.ArrayList;
import java.util.List;

public class AvroInputFormatTest {

	@Test
	public void testTypeSerialisation() throws IOException {
		File testFile = File.createTempFile("AvroSerTest", null);

		List<PersonName> authors = new ArrayList<PersonName>();
		authors.add(new PersonName("a", "b", "c", "d", "e", "f"));
		authors.add(new PersonName("aa", "bb", "cc", "dd", "ee", "ff"));

		org.apache.flink.api.java.avro.generated.Test test = new org.apache.flink.api.java.avro.generated.Test(authors);

		AvroInputFormat<org.apache.flink.api.java.avro.generated.Test> format =
				new AvroInputFormat<org.apache.flink.api.java.avro.generated.Test>(new Path(testFile.getAbsolutePath()), org.apache.flink.api.java.avro.generated.Test.class);
		TypeInformation<org.apache.flink.api.java.avro.generated.Test> te = format.getProducedType();
		System.out.println("te = "+te);
		ComparatorTestBase.TestOutputView target = new ComparatorTestBase.TestOutputView();
		TypeSerializer<org.apache.flink.api.java.avro.generated.Test> serializer = te.createSerializer();

		serializer.serialize(test, target);

		org.apache.flink.api.java.avro.generated.Test newTest = serializer.deserialize(target.getInputView());

		Assert.assertNotNull(newTest);

		testFile.delete();
	}
}
