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

import com.esotericsoftware.kryo.Serializer;

/**
 * Classes implementing this interface are able to register types with the
 * serialization system.
 */
public interface SerializerRegistrable {
	/**
	 * Registers the given class with a serializer for the class at the Kryo instance.
	 *
	 * Note that the serializer instance must be serializable (as defined by java.io.Serializable),
	 * because it may be distributed to the worker nodes by java serialization.
	 *
	 * @param type the type serialized with the given serializer.
	 * @param serializer The serializer to use.
	 * @throws IllegalArgumentException Thrown, if the serializer is not serializable.
	 */
	public void registerTypeWithKryoSerializer(Class<?> type, Serializer<?> serializer);

	/**
	 * Registers the given Serializer via its class as a serializer for the given type at the
	 * {@link org.apache.flink.api.java.typeutils.runtime.kryo.KryoSerializer}.
	 *
	 * @param type The class of the types serialized with the given serializer.
	 * @param serializerClass The class of the serializer to use.
	 */
	public void registerTypeWithKryoSerializer(Class<?> type, Class<? extends Serializer<?>> serializerClass);

	/**
	 * Registers a default serializer for the given class and its sub-classes at Kryo.
	 *
	 * @param type The class of the (sub-)types serialized with the given serializer.
	 * @param serializerClass The serializer to use with the types.
	 */
	public void registerDefaultKryoSerializer(Class<?> type, Class<? extends Serializer<?>> serializerClass);

	/**
	 * Registers a default serializer for the given class and its sub-classes at Kryo.
	 *
	 * Note that the serializer instance must be serializable (as defined by java.io.Serializable),
	 * because it may be distributed to the worker nodes by java serialization.
	 *
	 * @param clazz The class of the types serialized with the given serializer.
	 * @param serializer The serializer to use.
	 * @throws IllegalArgumentException Thrown, if the serializer is not serializable.
	 */
	public void registerDefaultKryoSerializer(Class<?> clazz, Serializer<?> serializer);

	/**
	 * Registers the given type with the serialization stack. If the type is eventually
	 * serialized as a POJO, then the type is registered with the POJO serializer. If the
	 * type ends up being serialized with Kryo, then it will be registered at Kryo to make
	 * sure that only tags are written.
	 *
	 * @param type The class of the type to register.
	 */
	public void registerType(Class<?> type);

}
