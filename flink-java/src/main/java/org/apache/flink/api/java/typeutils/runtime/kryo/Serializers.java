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
package org.apache.flink.api.java.typeutils.runtime.kryo;

import com.esotericsoftware.kryo.Kryo;
import com.esotericsoftware.kryo.Serializer;
import com.esotericsoftware.kryo.io.Input;
import com.esotericsoftware.kryo.io.Output;
import com.esotericsoftware.kryo.serializers.CollectionSerializer;
import com.google.protobuf.Message;
import com.twitter.chill.protobuf.ProtobufSerializer;
import com.twitter.chill.thrift.TBaseSerializer;
import de.javakaffee.kryoserializers.jodatime.JodaDateTimeSerializer;
import de.javakaffee.kryoserializers.jodatime.JodaIntervalSerializer;
import org.apache.avro.Schema;
import org.apache.avro.generic.GenericData;
import org.apache.avro.specific.SpecificRecordBase;
import org.apache.flink.api.common.JobExecutionResult;
import org.apache.flink.api.java.ExecutionEnvironment;
import org.apache.flink.api.java.typeutils.TypeExtractor;
import org.apache.thrift.protocol.TMessage;
import org.joda.time.DateTime;
import org.joda.time.Interval;
import scala.reflect.ClassTag;

import java.lang.reflect.Field;
import java.lang.reflect.ParameterizedType;
import java.lang.reflect.Type;
import java.util.ArrayList;
import java.util.Collection;
import java.util.HashSet;
import java.util.Set;


/**
 * Class containing utilities for the serializers of the Flink Runtime.
 *
 * Most of the serializers are automatically added to the system.
 *
 * Note that users can also implement the {@link com.esotericsoftware.kryo.KryoSerializable} interface
 * to provide custom serialization for their classes.
 * Also, there is a Java Annotation for adding a default serializer (@DefaultSerializer) to classes.
 */
public class Serializers {


	/**
	 * NOTE: This method is not a public Flink API.
	 *
	 * This method walks the entire hierarchy of the given type and registers all types it encounters
	 * to Kryo.
	 * It also watches for types which need special serializers.
	 */
	private static ExecutionEnvironment kryoRegEnv = new KryoRegistrationExecutionEnvironment();
	private static Set<Class<?>> alreadySeen = new HashSet<Class<?>>();
	public static void recursivelyRegisterType(Class<?> type) {
		alreadySeen.add(type);
		kryoRegEnv.registerType(type);
		addSerializerForType(kryoRegEnv, type);

		Field[] fields = type.getDeclaredFields();
		for(Field field : fields) {
			Type fieldType = field.getGenericType();
			if(fieldType instanceof ParameterizedType) { // field has generics
				ParameterizedType parameterizedFieldType = (ParameterizedType) fieldType;
				for(Type t: parameterizedFieldType.getActualTypeArguments()) {
					if(TypeExtractor.isClassType(t) ) {
						Class clazz = TypeExtractor.typeToClass(t);
						if(!alreadySeen.contains(clazz)) {
							recursivelyRegisterType(TypeExtractor.typeToClass(t));
						}
					}
				}
			}
			Class<?> clazz = field.getType();
			if(!alreadySeen.contains(clazz)) {
				recursivelyRegisterType(clazz);
			}
		}
	}

	public static void addSerializerForType(ExecutionEnvironment env, Class<?> type) {
		if(type.isAssignableFrom(Message.class)) {
			registerProtoBuf(env);
		}
		if(type.isAssignableFrom(TMessage.class)) {
			registerThrift(env);
		}
		if(type.isAssignableFrom(GenericData.Record.class)) {
			registerGenericAvro(env);
		}
		if(type.isAssignableFrom(SpecificRecordBase.class)) {
			registerSpecificAvro(env, (Class<? extends SpecificRecordBase>) type);
		}
		if(type.isAssignableFrom(DateTime.class) || type.isAssignableFrom(Interval.class)) {
			registerJodaTime(env);
		}
	}

	/**
	 * Register serializers required for Google Protocol Buffers
	 * with Flink runtime.
	 */
	public static void registerProtoBuf(ExecutionEnvironment env) {
		// Google Protobuf (FLINK-1392)
		env.registerTypeWithKryoSerializer(Message.class, ProtobufSerializer.class);
	}

	/**
	 * Register Apache Thrift messages
	 */
	public static void registerThrift(ExecutionEnvironment env) {
		// TBaseSerializer states it should be initalized as a default Kryo serializer
		env.registerDefaultKryoSerializer(TMessage.class, TBaseSerializer.class);
		env.registerType(TMessage.class);
	}

	/**
	 * Register these serializers for using Avro's {@see GenericData.Record} and classes
	 * implementing {@see org.apache.avro.specific.SpecificRecordBase}
	 */
	public static void registerGenericAvro(ExecutionEnvironment env) {
		// Avro POJOs contain java.util.List which have GenericData.Array as their runtime type
		// because Kryo is not able to serialize them properly, we use this serializer for them
		env.registerTypeWithKryoSerializer(GenericData.Array.class, new SpecificInstanceCollectionSerializer(ArrayList.class));
		// We register this serializer for users who want to use untyped Avro records (GenericData.Record).
		// Kryo is able to serialize everything in there, except for the Schema.
		// This serializer is very slow, but using the GenericData.Records of Kryo is in general a bad idea.
		// we add the serializer as a default serializer because Avro is using a private sub-type at runtime.
		env.registerDefaultKryoSerializer(Schema.class, new AvroSchemaSerializer());
	}


	public static void registerSpecificAvro(ExecutionEnvironment env, Class<? extends SpecificRecordBase> avroType) {
		registerGenericAvro(env);
		// This rule only applies if users explicitly use the GenericTypeInformation for the avro types
		// usually, we are able to handle Avro POJOs with the POJO serializer.
		// (However only if the GenericData.Array type is registered!)
		ClassTag<SpecificRecordBase> tag = scala.reflect.ClassTag$.MODULE$.apply(avroType);
		env.registerTypeWithKryoSerializer(avroType, com.twitter.chill.avro.AvroSerializer.SpecificRecordSerializer(tag));
	}


	/**
	 * Currently, the following classes of JodaTime are supported:
	 * 	- DateTime
	 * 	- Interval
	 *
	 * 	The following chronologies are supported: (see {@link de.javakaffee.kryoserializers.jodatime.JodaDateTimeSerializer})
	 * <ul>
	 * <li>{@link org.joda.time.chrono.ISOChronology}</li>
	 * <li>{@link org.joda.time.chrono.CopticChronology}</li>
	 * <li>{@link org.joda.time.chrono.EthiopicChronology}</li>
	 * <li>{@link org.joda.time.chrono.GregorianChronology}</li>
	 * <li>{@link org.joda.time.chrono.JulianChronology}</li>
	 * <li>{@link org.joda.time.chrono.IslamicChronology}</li>
	 * <li>{@link org.joda.time.chrono.BuddhistChronology}</li>
	 * <li>{@link org.joda.time.chrono.GJChronology}</li>
	 * </ul>
	 */
	public static void registerJodaTime(ExecutionEnvironment env) {
		env.registerTypeWithKryoSerializer(DateTime.class, JodaDateTimeSerializer.class);
		env.registerTypeWithKryoSerializer(Interval.class, JodaIntervalSerializer.class);
	}

	/**
	 * Register less frequently used serializers
	 */
	public static void registerJavaUtils(ExecutionEnvironment env) {
		// BitSet, Regex is already present through twitter-chill.
	}


	// --------------------------------------------------------------------------------------------
	// Custom Serializers
	// --------------------------------------------------------------------------------------------

	/**
	 * Special serializer for Java collections enforcing certain instance types.
	 * Avro is serializing collections with an "GenericData.Array" type. Kryo is not able to handle
	 * this type, so we use ArrayLists.
	 */
	public static class SpecificInstanceCollectionSerializer<T extends Collection> extends CollectionSerializer {
		Class<T> type;
		public SpecificInstanceCollectionSerializer(Class<T> type) {
			this.type = type;
		}

		@Override
		protected Collection create(Kryo kryo, Input input, Class<Collection> type) {
			return kryo.newInstance(this.type);
		}

		@Override
		protected Collection createCopy(Kryo kryo, Collection original) {
			return kryo.newInstance(this.type);
		}
	}

	/**
	 * Slow serialization approach for Avro schemas.
	 * This is only used with {{@link org.apache.avro.generic.GenericData.Record}} types.
	 * Having this serializer, we are able to handle avro Records.
	 */
	public static class AvroSchemaSerializer extends Serializer<Schema> {
		@Override
		public void write(Kryo kryo, Output output, Schema object) {
			String schemaAsString = object.toString(false);
			output.writeString(schemaAsString);
		}

		@Override
		public Schema read(Kryo kryo, Input input, Class<Schema> type) {
			String schemaAsString = input.readString();
			// the parser seems to be stateful, to we need a new one for every type.
			Schema.Parser sParser = new Schema.Parser();
			return sParser.parse(schemaAsString);
		}
	}

	/**
	 * Fake execution environment to use the same interfaces for registering serializer groups
	 */
	private static class KryoRegistrationExecutionEnvironment extends ExecutionEnvironment {

		@Override
		public JobExecutionResult execute(String jobName) throws Exception {
			throw new UnsupportedOperationException("Fake EE");
		}

		@Override
		public String getExecutionPlan() throws Exception {
			throw new UnsupportedOperationException("Fake EE");
		}

	}
}
