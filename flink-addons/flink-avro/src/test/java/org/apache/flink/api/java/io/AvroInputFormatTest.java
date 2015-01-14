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

import org.apache.avro.Schema;
import org.apache.avro.generic.GenericArray;
import org.apache.avro.generic.GenericData;
import org.apache.avro.generic.GenericRecord;
import org.apache.avro.generic.GenericRecordBuilder;
import org.apache.flink.api.common.typeinfo.TypeInformation;
import org.apache.flink.api.common.typeutils.ComparatorTestBase;
import org.apache.flink.api.common.typeutils.TypeSerializer;
import org.apache.flink.api.java.avro.generated.PersonName;
import org.apache.flink.api.java.typeutils.GenericTypeInfo;
import org.apache.flink.api.java.typeutils.TypeExtractor;
import org.apache.flink.core.fs.Path;
import org.junit.Assert;
import org.junit.Test;

import java.io.File;
import java.io.IOException;
import java.util.ArrayList;
import java.util.List;

public class AvroInputFormatTest {

	@Test
	public void testTypeSerialisationGenType() throws IOException {

		List<PersonName> authors = new ArrayList<PersonName>();
		authors.add(new PersonName("a", "b", "c", "d", "e", "f"));
		authors.add(new PersonName("aa", "bb", "cc", "dd", "ee", "ff"));

		org.apache.flink.api.java.avro.generated.Test test = new org.apache.flink.api.java.avro.generated.Test(authors);
		GenericRecordBuilder testGenBuilder = new GenericRecordBuilder(test.getSchema());
		testGenBuilder.set("authors", authors);
		GenericData.Record testRecord = testGenBuilder.build();
		TypeInformation<org.apache.flink.api.java.avro.generated.Test> te = (TypeInformation<org.apache.flink.api.java.avro.generated.Test>) TypeExtractor.createTypeInfo(org.apache.flink.api.java.avro.generated.Test.class);
		System.out.println("te = "+te);
		ComparatorTestBase.TestOutputView target = new ComparatorTestBase.TestOutputView();
		TypeSerializer<org.apache.flink.api.java.avro.generated.Test> serializer = te.createSerializer();

		serializer.serialize(test, target);

		org.apache.flink.api.java.avro.generated.Test newTest = serializer.deserialize(target.getInputView());

		Assert.assertNotNull(newTest);
	}

	@Test
	public void testTypeSerialisationGenericRecord() throws IOException {
		Schema schema = org.apache.flink.api.java.avro.generated.Test.SCHEMA$;


		Schema arrSchema =schema.getField("authors").schema();
		System.out.println("arrSchema="+arrSchema + " type=" + arrSchema.getType());
		GenericData.Array<GenericData.Record> authors= new GenericData.Array<GenericData.Record>(2, arrSchema);
	//	GenericRecordBuilder authorBuilder = new GenericRecordBuilder(schema.getField("authors").schema());
	//	GenericData.Record authors = authorBuilder.build();

		/*List<PersonName> authors = new ArrayList<PersonName>();
		authors.add(new PersonName("a", "b", "c", "d", "e", "f"));
		authors.add(new PersonName("aa", "bb", "cc", "dd", "ee", "ff")); */
		// only for the schema

		GenericRecordBuilder testGenBuilder = new GenericRecordBuilder(schema);
		testGenBuilder.set("authors", authors);
		GenericData.Record testRecord = testGenBuilder.build();

		TypeInformation<GenericData.Record> te = (TypeInformation<GenericData.Record>) TypeExtractor.createTypeInfo(GenericData.Record.class);
		System.out.println("got te = "+te);
		ComparatorTestBase.TestOutputView target = new ComparatorTestBase.TestOutputView();
		TypeSerializer<GenericData.Record> serializer = te.createSerializer();

		serializer.serialize(testRecord, target);

		GenericData.Record newTest = serializer.deserialize(target.getInputView());
		Assert.assertNotNull(newTest);
		List<PersonName> auth = (List<PersonName>) newTest.get("authors");
		Assert.assertNotNull(auth);
		Assert.assertEquals(2, auth.size());


	}
}
