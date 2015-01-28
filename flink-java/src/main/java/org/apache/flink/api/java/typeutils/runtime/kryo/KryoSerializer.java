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
import com.esotericsoftware.kryo.KryoException;
import com.esotericsoftware.kryo.Serializer;
import com.esotericsoftware.kryo.factories.ReflectionSerializerFactory;
import com.esotericsoftware.kryo.io.Input;
import com.esotericsoftware.kryo.io.Output;
import com.esotericsoftware.kryo.serializers.JavaSerializer;
import com.twitter.chill.ScalaKryoInstantiator;

import org.apache.flink.api.common.typeutils.TypeSerializer;
import org.apache.flink.api.java.typeutils.runtime.DataInputViewStream;
import org.apache.flink.api.java.typeutils.runtime.DataOutputViewStream;
import org.apache.flink.api.java.typeutils.runtime.NoFetchingInput;
import org.apache.flink.core.memory.DataInputView;
import org.apache.flink.core.memory.DataOutputView;

import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.io.EOFException;
import java.io.IOException;
import java.io.ObjectInputStream;
import java.io.ObjectOutputStream;
import java.lang.reflect.Modifier;
import java.util.Collections;
import java.util.HashMap;
import java.util.HashSet;
import java.util.Map;
import java.util.Set;

/**
 * A type serializer that serializes its type using the Kryo serialization
 * framework (https://github.com/EsotericSoftware/kryo).
 * 
 * This serializer is intended as a fallback serializer for the cases that are
 * not covered by the basic types, tuples, and POJOs.
 *
 * @param <T> The type to be serialized.
 */
public class KryoSerializer<T> extends TypeSerializer<T> {
	
	private static final long serialVersionUID = 4L;

	// static registered types
	private static Set<Class<?>> staticRegisteredTypes = new HashSet<Class<?>>();

	// static registered types with serializers
	private static Map<Class<?>, Serializer<?>> staticRegisteredTypesWithSerializers = new HashMap<Class<?>, Serializer<?>>();
	private static Map<Class<?>, Class<? extends Serializer<?>>> staticRegisteredTypesWithSerializerClasses = new HashMap<Class<?>, Class<? extends Serializer<?>>>();

	// static default serializers
	private static Map<Class<?>, Serializer<?>> staticRegisteredDefaultSerializers = new HashMap<Class<?>, Serializer<?>>();
	private static Map<Class<?>, Class<? extends Serializer<?>>> staticRegisteredDefaultSerializerClasses = new HashMap<Class<?>, Class<? extends Serializer<?>>>();


	
	// ------------------------------------------------------------------------

	// registered types
	private final Set<Class<?>> registeredTypes;

	// registered types with serializers
	private final Map<Class<?>, Serializer<?>> registeredTypesWithSerializers;
	private final Map<Class<?>, Class<? extends Serializer<?>>> registeredTypesWithSerializerClasses;

	// static default serializers
	private final Map<Class<?>, Serializer<?>> registeredDefaultSerializers;
	private final Map<Class<?>, Class<? extends Serializer<?>>> registeredDefaultSerializerClasses;

	// the type this KryoSerializer has been created for.
	private final Class<T> type;
	
	// ------------------------------------------------------------------------
	// The fields below are lazily initialized after de-serialization

	private transient Kryo kryo;
	private transient T copyInstance;
	
	private transient DataOutputView previousOut;
	private transient DataInputView previousIn;
	
	private transient Input input;
	private transient Output output;
	
	// ------------------------------------------------------------------------
	public KryoSerializer(Class<T> type){

		String fullStackTrace = org.apache.commons.lang.exception.ExceptionUtils.getFullStackTrace(
				new RuntimeException("Thread "+Thread.currentThread().getId()+" creates new KryoSerializer"));
		System.out.println(fullStackTrace);

		if(type == null){
			throw new NullPointerException("Type class cannot be null.");
		}
		this.type = type;

		// create copies of the statically registered serializers
		// we use static synchronization to safeguard against concurrent use
		// of the static collections.
		synchronized (KryoSerializer.class) {

			// registered types
			this.registeredTypes = staticRegisteredTypes.isEmpty() ?
					Collections.<Class<?>>emptySet() :
					new HashSet<Class<?>>(staticRegisteredTypes);

			// registered types with serializers
			this.registeredTypesWithSerializers = deepCopyMap(staticRegisteredTypesWithSerializers);

			this.registeredTypesWithSerializerClasses = staticRegisteredTypesWithSerializerClasses.isEmpty() ?
					Collections.<Class<?>, Class<? extends Serializer<?>>>emptyMap() :
					new HashMap<Class<?>, Class<? extends Serializer<?>>>(staticRegisteredTypesWithSerializerClasses);

			// static default serializers
			this.registeredDefaultSerializers = deepCopyMap(staticRegisteredDefaultSerializers);

			this.registeredDefaultSerializerClasses = staticRegisteredDefaultSerializerClasses.isEmpty() ?
					Collections.<Class<?>, Class<? extends Serializer<?>>>emptyMap() :
					new HashMap<Class<?>, Class<? extends Serializer<?>>>(staticRegisteredDefaultSerializerClasses);
		}
		
	}

	private void readObject(ObjectInputStream ois) {
		try {
			ois.defaultReadObject();
		} catch (IOException e) {
			e.printStackTrace();
		} catch (ClassNotFoundException e) {
			e.printStackTrace();
		}
		String fullStackTrace = org.apache.commons.lang.exception.ExceptionUtils.getFullStackTrace(
				new RuntimeException("Thread "+Thread.currentThread().getId()+" creates new KryoSerializer"));
		System.out.println(fullStackTrace);
	}
	/**
	 * We need to copy the stateful kryo serializers for each Kryo instance,
	 * because we can not assume that they are thread-safe.
	 */
	private static Map<Class<?>, Serializer<?>> deepCopyMap(Map<Class<?>, Serializer<?>> in) {
		if(in.isEmpty()) {
			return Collections.<Class<?>, Serializer<?>>emptyMap();
		}
		Map<Class<?>, Serializer<?>> out = new HashMap<Class<?>, Serializer<?>>(in.size());
		for(Map.Entry<Class<?>, Serializer<?>> inElement : in.entrySet()) {
			// use java serialization to create a copy of the serializer
			ObjectOutputStream oos = null;
			ObjectInputStream ois = null;
			Serializer<?> copy = null;
			try
			{
				ByteArrayOutputStream bos = new ByteArrayOutputStream();
				oos = new ObjectOutputStream(bos);
				oos.writeObject(inElement.getValue());
				oos.flush();
				ByteArrayInputStream bin = new ByteArrayInputStream(bos.toByteArray());
				ois = new ObjectInputStream(bin);
				copy = (Serializer<?>) ois.readObject();
			} catch(Exception e) {
				throw new RuntimeException("Error creating a deep copy of serializer "+inElement.getValue(), e);
			} finally {
				try {
					oos.close();
					ois.close();
				} catch(Throwable e) {
					throw new RuntimeException("Error closing streams", e);
				}
			}
			out.put(inElement.getKey(), copy);
		}

		return out;
	}

	// ------------------------------------------------------------------------

	@Override
	public boolean isImmutableType() {
		return false;
	}

	@Override
	public boolean isStateful() {
		return true;
	}

	@Override
	public T createInstance() {
		if(Modifier.isAbstract(type.getModifiers()) || Modifier.isInterface(type.getModifiers()) ) {
			return null;
		} else {
			checkKryoInitialized();
			try {
				return kryo.newInstance(type);
			} catch(Throwable e) {
				return null;
			}
		}
	}

	@SuppressWarnings("unchecked")
	@Override
	public T copy(T from) {
		if (from == null) {
			return null;
		}
		checkKryoInitialized();
		try {
			return kryo.copy(from);
		}
		catch(KryoException ke) {
			// kryo was unable to copy it, so we do it through serialization:
			ByteArrayOutputStream baout = new ByteArrayOutputStream();
			Output output = new Output(baout);

			kryo.writeObject(output, from);

			output.close();

			ByteArrayInputStream bain = new ByteArrayInputStream(baout.toByteArray());
			Input input = new Input(bain);

			return (T)kryo.readObject(input, from.getClass());
		}
	}
	
	@Override
	public T copy(T from, T reuse) {
		return copy(from);
	}

	@Override
	public int getLength() {
		return -1;
	}

	@Override
	public void serialize(T record, DataOutputView target) throws IOException {
		check();
		System.out.println("serialize() -- Kryo instance "+System.identityHashCode(this)+" on thread "+Thread.currentThread().getId());
		checkKryoInitialized();
		if (target != previousOut) {
			DataOutputViewStream outputStream = new DataOutputViewStream(target);
			output = new Output(outputStream);
			previousOut = target;
		}

		try {
			kryo.writeClassAndObject(output, record);
			output.flush();
		}
		catch (KryoException ke) {
			Throwable cause = ke.getCause();
			if (cause instanceof EOFException) {
				throw (EOFException) cause;
			}
			else {
				throw ke;
			}
		}
	}
	static Map<Integer, Long> instanceChecker = new HashMap<Integer, Long>();
	public void check() {
		int ownObjectId = System.identityHashCode(this);
		Long ownThreadId = Thread.currentThread().getId();
		Long hasThread = instanceChecker.get(ownObjectId);
		if(hasThread == null) {
			instanceChecker.put(ownObjectId, ownThreadId);
		} else {
			if(ownThreadId == hasThread) {
				System.out.println("all good with this instance");
			} else {
				Set<Thread> threadSet = Thread.getAllStackTraces().keySet();
				for(Thread t : threadSet) {
					System.out.println("Thread id="+t.getId()+" name="+t.getName());
				}
				System.out.println("Found the culprit. We are in thread "+ownThreadId+" Kryo belongs to thread "+hasThread);
			}
		}
	}

	@SuppressWarnings("unchecked")
	@Override
	public T deserialize(DataInputView source) throws IOException {
		check();
		System.out.println("deserialize() -- Kryo instance "+System.identityHashCode(this)+" on thread "+Thread.currentThread().getId()+ " name="+Thread.currentThread().getName());
		checkKryoInitialized();
		if (source != previousIn) {
			DataInputViewStream inputStream = new DataInputViewStream(source);
			input = new NoFetchingInput(inputStream);
			previousIn = source;
		}
		return (T) kryo.readClassAndObject(input);
	}
	
	@Override
	public T deserialize(T reuse, DataInputView source) throws IOException {
		return deserialize(source);
	}

	@Override
	public void copy(DataInputView source, DataOutputView target) throws IOException {
		checkKryoInitialized();
		if(this.copyInstance == null){
			this.copyInstance = createInstance();
		}

		T tmp = deserialize(copyInstance, source);
		serialize(tmp, target);
	}
	
	// --------------------------------------------------------------------------------------------
	
	@Override
	public int hashCode() {
		return type.hashCode();
	}
	
	@Override
	public boolean equals(Object obj) {
		if (obj != null && obj instanceof KryoSerializer) {
			KryoSerializer<?> other = (KryoSerializer<?>) obj;
			return other.type == this.type;
		} else {
			return false;
		}
	}
	
	// --------------------------------------------------------------------------------------------

	private void checkKryoInitialized() {
		if (this.kryo == null) {
			this.kryo = new ScalaKryoInstantiator().newKryo();

			// Throwable and all subclasses should be serialized via java serialization
			kryo.addDefaultSerializer(Throwable.class, new JavaSerializer());

			// add default serializers
			for(Map.Entry<Class<?>, Serializer<?>> e : registeredDefaultSerializers.entrySet()) {
				kryo.addDefaultSerializer(e.getKey(), e.getValue());
			}
			for(Map.Entry<Class<?>, Class<? extends Serializer<?>>> e : registeredDefaultSerializerClasses.entrySet()) {
				kryo.addDefaultSerializer(e.getKey(), e.getValue());
			}

			// register the type of our class
			kryo.register(type);
			
			// register given types. we do this first so that any registration of a
			// more specific serializer overrides this
			for (Class<?> type : registeredTypes) {
				kryo.register(type);
			}
			
			// register given serializer classes
			for (Map.Entry<Class<?>, Class<? extends Serializer<?>>> e : registeredTypesWithSerializerClasses.entrySet()) {
				Class<?> typeClass = e.getKey();
				Class<? extends Serializer<?>> serializerClass = e.getValue();
				
				Serializer<?> serializer = 
						ReflectionSerializerFactory.makeSerializer(kryo, serializerClass, typeClass);
				kryo.register(typeClass, serializer);
			}

			// register given serializers
			for (Map.Entry<Class<?>, Serializer<?>> e : registeredTypesWithSerializers.entrySet()) {
				kryo.register(e.getKey(), e.getValue());
			}

			kryo.setRegistrationRequired(false);
			kryo.setClassLoader(Thread.currentThread().getContextClassLoader());
		}
	}
	
	// --------------------------------------------------------------------------------------------
	// For registering custom serializers and types
	// --------------------------------------------------------------------------------------------


	//
	// Type with Serializer
	//

	/**
	 * Registers the given class with a serializer for the class at the Kryo instance.
	 *
	 * Note that the serializer instance must be serializable (as defined by java.io.Serializable),
	 * because it may be distributed to the worker nodes by java serialization.
	 * 
	 * @param clazz The class of the types serialized with the given serializer.
	 * @param serializer The serializer to use.
	 * @throws IllegalArgumentException Thrown, if the serializer is not serializable.
	 */
	public static void registerTypeWithSerializer(Class<?> clazz, Serializer<?> serializer) {
		if (clazz == null || serializer == null) {
			throw new NullPointerException("Cannot register null class or serializer.");
		}
		if (!(serializer instanceof java.io.Serializable)) {
			throw new IllegalArgumentException("The serializer instance '"+serializer+"' must be serializable, (for distributing it in the cluster), "
					+ "as defined by java.io.Serializable. For stateless serializers, you can use the "
					+ "'registerTypeWithSerializer(Class, Class)' method to register the serializer via its class.");
		}
		
		synchronized (KryoSerializer.class) {
			staticRegisteredTypesWithSerializers.put(clazz, serializer);
		}
	}

	/**
	 * Registers the given class with a serializer class at the Kryo instance.
	 * 
	 * @param clazz The class of the types serialized with the given serializer.
	 * @param serializerClass The serializer to use.
	 */
	public static void registerTypeWithSerializer(Class<?> clazz, Class<? extends Serializer<?>> serializerClass) {
		if (clazz == null || serializerClass == null) {
			throw new NullPointerException("Cannot register null class or serializer.");
		}
		
		synchronized (KryoSerializer.class) {
			staticRegisteredTypesWithSerializerClasses.put(clazz, serializerClass);
		}
	}

	//
	// Default Serializers
	//

	/**
	 * Registers a default serializer for the given class and its sub-classes at Kryo.
	 *
	 * @param clazz The class of the types serialized with the given serializer.
	 * @param serializerClass The serializer to use.
	 */
	public static void registerDefaultSerializer(Class<?> clazz, Class<? extends Serializer<?>> serializerClass) {
		if (clazz == null || serializerClass == null) {
			throw new NullPointerException("Cannot register null class or serializer.");
		}

		synchronized (KryoSerializer.class) {
			staticRegisteredDefaultSerializerClasses.put(clazz, serializerClass);
		}
	}

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
	public static void registerDefaultSerializer(Class<?> clazz, Serializer<?> serializer) {
		if (clazz == null || serializer == null) {
			throw new NullPointerException("Cannot register null class or serializer.");
		}
		if (!(serializer instanceof java.io.Serializable)) {
			throw new IllegalArgumentException("The serializer instance must be serializable, (for distributing it in the cluster), "
					+ "as defined by java.io.Serializable. For stateless serializers, you can use the "
					+ "'registerDefaultSerializer(Class, Class)' method to register the serializer via its class.");
		}

		synchronized (KryoSerializer.class) {
			staticRegisteredDefaultSerializers.put(clazz, serializer);
		}
	}


	//
	// Type without Serializer
	//
	
	/**
	 * Registers the given type with Kryo. Registering the type allows Kryo to write abbreviated
	 * name tags, rather than full class names, thereby vastly increasing the serialization
	 * performance in many cases.
	 *  
	 * @param type The class of the type to register.
	 */
	public static void registerType(Class<?> type) {
		if (type == null) {
			throw new NullPointerException("Cannot register null type class.");
		}
		// no need to register primitive types (also, the serialization of Kryo will fail)
		if(type.isPrimitive()) {
			return;
		}
		
		synchronized (KryoSerializer.class) {
			staticRegisteredTypes.add(type);
		}
	}

	// --------------------------------------------------------------------------------------------
	// For testing
	// --------------------------------------------------------------------------------------------
	
	Kryo getKryo() {
		checkKryoInitialized();
		return this.kryo;
	}
}
