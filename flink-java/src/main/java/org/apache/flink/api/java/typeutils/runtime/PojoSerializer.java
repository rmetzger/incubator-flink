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

package org.apache.flink.api.java.typeutils.runtime;

import java.io.IOException;
import java.io.ObjectInputStream;
import java.io.ObjectOutputStream;
import java.lang.reflect.Field;
import java.lang.reflect.Modifier;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.apache.flink.api.common.typeutils.TypeSerializer;
import org.apache.flink.api.java.typeutils.TypeExtractor;
import org.apache.flink.core.memory.DataInputView;
import org.apache.flink.core.memory.DataOutputView;


public final class PojoSerializer<T> extends TypeSerializer<T> {

	private static final long serialVersionUID = 1L;

	private final Class<T> clazz;

	private TypeSerializer<Object>[] fieldSerializers;

	// We need to handle these ourselves in writeObject()/readObject()
	private transient Field[] fields;

	private int numFields;

	private final boolean stateful;

	private transient Map<Class<?>, TypeSerializer> subclassSerializerCache;


	@SuppressWarnings("unchecked")
	public PojoSerializer(Class<T> clazz, TypeSerializer<?>[] fieldSerializers, Field[] fields) {
		this.clazz = clazz;
		this.fieldSerializers = (TypeSerializer<Object>[]) fieldSerializers;
		this.fields = fields;
		this.numFields = fieldSerializers.length;

		for (int i = 0; i < numFields; i++) {
			this.fields[i].setAccessible(true);
		}

		boolean stateful = false;
		for (TypeSerializer<?> ser : fieldSerializers) {
			if (ser.isStateful()) {
				stateful = true;
				break;
			}
		}
		this.stateful = stateful;

		subclassSerializerCache = new HashMap<Class<?>, TypeSerializer>();
	}

	private void writeObject(ObjectOutputStream out)
			throws IOException, ClassNotFoundException {
		out.defaultWriteObject();
		out.writeInt(fields.length);
		for (Field field: fields) {
			out.writeObject(field.getDeclaringClass());
			out.writeUTF(field.getName());
		}
	}

	private void readObject(ObjectInputStream in)
			throws IOException, ClassNotFoundException {
		in.defaultReadObject();
		int numKeyFields = in.readInt();
		fields = new Field[numKeyFields];
		for (int i = 0; i < numKeyFields; i++) {
			Class<?> clazz = (Class<?>)in.readObject();
			String fieldName = in.readUTF();
			fields[i] = null;
			// try superclasses as well
			while (clazz != null) {
				try {
					fields[i] = clazz.getDeclaredField(fieldName);
					fields[i].setAccessible(true);
					break;
				} catch (NoSuchFieldException e) {
					clazz = clazz.getSuperclass();
				}
			}
			if (fields[i] == null) {
				throw new RuntimeException("Class resolved at TaskManager is not compatible with class read during Plan setup."
						+ " (" + fieldName + ")");
			}
		}

		subclassSerializerCache = new HashMap<Class<?>, TypeSerializer>();
	}

	private TypeSerializer getSubclassSerializer(Class<?> subclass) {
		TypeSerializer<?> result = subclassSerializerCache.get(subclass);
		if (result == null) {
			result = TypeExtractor.createTypeInfo(subclass).createSerializer();
			if (!(result instanceof PojoSerializer)) {
				throw new RuntimeException("Subclass " + subclass + " cannot be analyzed as POJO TypeInfo.");
			}
			PojoSerializer<?> subclassSerializer = (PojoSerializer<?>) result;
			subclassSerializer.removeBaseFields(this);
			subclassSerializerCache.put(subclass, result);

		}
		return result;
	}

	private boolean hasField(Field f) {
		for (Field field: fields) {
			if (f.equals(field)) {
				return true;
			}
		}
		return false;
	}

	@SuppressWarnings("unchecked")
	private void removeBaseFields(PojoSerializer<?> baseSerializer) {
		List<Field> newFields = new ArrayList<Field>();
		List<TypeSerializer<Object>> newFieldSerializers = new ArrayList<TypeSerializer<Object>>();

		for (int i = 0; i < numFields; i++) {
			if (!baseSerializer.hasField(fields[i])) {
				newFields.add(fields[i]);
				newFieldSerializers.add(fieldSerializers[i]);
			}
		}

		fields = newFields.toArray(new Field[newFields.size()]);
		fieldSerializers = newFieldSerializers.toArray(new TypeSerializer[newFieldSerializers.size()]);
		numFields = fields.length;
	}
	
	@Override
	public boolean isImmutableType() {
		return false;
	}

	@Override
	public boolean isStateful() {
		return this.stateful;
	}
	
	
	@Override
	public T createInstance() {
		if (clazz.isInterface() || Modifier.isAbstract(clazz.getModifiers())) {
			return null;
		}
		try {
			T t = clazz.newInstance();
			initializeFields(t);
			return t;
		}
		catch (Exception e) {
//			throw new RuntimeException("Cannot instantiate class.", e);
			return null;
		}
	}

	protected void initializeFields(T t) {
		for (int i = 0; i < numFields; i++) {
			try {
				fields[i].set(t, fieldSerializers[i].createInstance());
			} catch (IllegalAccessException e) {
				throw new RuntimeException("Cannot initialize fields.", e);
			}
		}
	}

	@Override
	@SuppressWarnings("unchecked")
	public T copy(T from) {
		T target;
		try {
			target = (T) from.getClass().newInstance();
		}
		catch (Throwable t) {
			throw new RuntimeException("Cannot instantiate class.", t);
		}
		
		try {
			for (int i = 0; i < numFields; i++) {
				Object copy = fieldSerializers[i].copy(fields[i].get(from));
				fields[i].set(target, copy);
			}
		}
		catch (IllegalAccessException e) {
			throw new RuntimeException("Error during POJO copy, this should not happen since we check the fields before.");
		}

		// If the class is actually a subclass, also copy the subclass fields.
		Class<?> subclass = from.getClass();
		if (!(clazz == subclass)) {
			TypeSerializer subclassSerializer = getSubclassSerializer(subclass);
			subclassSerializer.copy(from, target);
		}
		return target;
	}
	
	@Override
	@SuppressWarnings("unchecked")
	public T copy(T from, T reuse) {
		Class<?> fromClass = from.getClass();
		if (reuse == null || fromClass != reuse.getClass()) {
			// cannot reuse, do a non-reuse copy
			return copy(from);
		}

		try {
			for (int i = 0; i < numFields; i++) {
				Object copy = fieldSerializers[i].copy(fields[i].get(from), fields[i].get(reuse));
				fields[i].set(reuse, copy);
			}
		} catch (IllegalAccessException e) {
			throw new RuntimeException("Error during POJO copy, this should not happen since we check the fields" +
					"before.");
		}

		// If the class is actually a subclass, also copy the subclass fields.
		if (clazz != fromClass) {
			TypeSerializer subclassSerializer = getSubclassSerializer(fromClass);
			subclassSerializer.copy(from, reuse);
		}

		return reuse;
	}

	@Override
	public int getLength() {
		return -1;
	}


	@Override
	@SuppressWarnings("unchecked")
	public void serialize(T value, DataOutputView target) throws IOException {
		// handle null values
		if (value == null) {
			target.writeBoolean(true);
			return;
		} else {
			target.writeBoolean(false);
		}

		if (clazz == value.getClass()) {
			target.writeBoolean(true);
		} else {
			target.writeBoolean(false);
			Class<?> subclass = value.getClass();
			target.writeUTF(subclass.getName());
		}

		try {
			for (int i = 0; i < numFields; i++) {
				Object o = fields[i].get(value);
				if(o == null) {
					target.writeBoolean(true); // null field handling
				} else {
					target.writeBoolean(false);
					fieldSerializers[i].serialize(o, target);
				}
			}
		} catch (IllegalAccessException e) {
			throw new RuntimeException("Error during POJO copy, this should not happen since we check the fields" +
					"before.");
		}

		// Serialize subclass fields as well.
		if (!(clazz == value.getClass())) {
			Class<?> subclass = value.getClass();
			TypeSerializer subclassSerializer = getSubclassSerializer(subclass);
			subclassSerializer.serialize(value, target);
		}
	}

	@Override
	@SuppressWarnings("unchecked")
	public T deserialize(DataInputView source) throws IOException {
		boolean isNull = source.readBoolean();
		if(isNull) {
			return null;
		}

		T target;

		Class<?> subclass = null;
		TypeSerializer subclassSerializer = null;

		boolean isExactClass = source.readBoolean();
		if (!isExactClass) {
			String subclassName = source.readUTF();
			try {
				subclass = Class.forName(subclassName, true, this.getClass().getClassLoader());
			} catch (ClassNotFoundException e) {
				throw new RuntimeException("Cannot instantiate class.", e);
			}
			subclassSerializer = getSubclassSerializer(subclass);
			target = (T) subclassSerializer.createInstance();
			// also initialize fields for which the subclass serializer is not responsible
			initializeFields(target);
		} else {
			target = createInstance();
		}

		try {
			for (int i = 0; i < numFields; i++) {
				isNull = source.readBoolean();
				if(isNull) {
					fields[i].set(target, null);
				} else {
					Object field = fieldSerializers[i].deserialize(source);
					fields[i].set(target, field);
				}
			}
		} catch (IllegalAccessException e) {
			throw new RuntimeException("Error during POJO copy, this should not happen since we check the fields" +
					"before.");
		}

		if (subclass != null) {
			subclassSerializer.deserialize(target, source);
		}
		return target;
	}
	
	@Override
	@SuppressWarnings("unchecked")
	public T deserialize(T reuse, DataInputView source) throws IOException {
		// handle null values
		boolean isNull = source.readBoolean();
		if (isNull) {
			return null;
		}

		Class<?> subclass = null;
		TypeSerializer subclassSerializer = null;
		boolean isExactClass = source.readBoolean();
		if (!isExactClass) {
			String subclassName = source.readUTF();
			try {
				subclass = Class.forName(subclassName, true, this.getClass().getClassLoader());
			} catch (ClassNotFoundException e) {
				throw new RuntimeException("Cannot instantiate class.", e);
			}
			subclassSerializer = getSubclassSerializer(subclass);

			if (reuse == null || subclass != reuse.getClass()) {
				// cannot reuse
				reuse = (T) subclassSerializer.createInstance();
				// also initialize fields for which the subclass serializer is not responsible
				initializeFields(reuse);
			}
		} else {
			if (reuse == null || clazz != reuse.getClass()) {
				reuse = createInstance();
			}
		}

		try {
			for (int i = 0; i < numFields; i++) {
				isNull = source.readBoolean();
				if(isNull) {
					fields[i].set(reuse, null);
				} else {
					Object field = fieldSerializers[i].deserialize(fields[i].get(reuse), source);
					fields[i].set(reuse, field);
				}
			}
		} catch (IllegalAccessException e) {
			throw new RuntimeException("Error during POJO copy, this should not happen since we check the fields" +
					"before.");
		}

		if (subclass != null) {
			subclassSerializer.deserialize(reuse, source);
		}

		return reuse;
	}

	@Override
	public void copy(DataInputView source, DataOutputView target) throws IOException {
		// copy the Non-Null/Null tag
		target.writeBoolean(source.readBoolean());

		boolean isExactClass = source.readBoolean();
		Class<?> subclass = null;
		target.writeBoolean(isExactClass);
		if (!isExactClass) {
			String className = source.readUTF();
			target.writeUTF(className);
			try {
				subclass = Class.forName(className, true, this.getClass().getClassLoader());
			} catch (ClassNotFoundException e) {
				throw new RuntimeException("Cannot instantiate class.", e);
			}
		}

		for (int i = 0; i < numFields; i++) {
			target.writeBoolean(source.readBoolean());
			fieldSerializers[i].copy(source, target);
		}

		if (subclass != null) {
			TypeSerializer subclassSerializer = getSubclassSerializer(subclass);
			subclassSerializer.copy(source, target);
		}
	}
	
	@Override
	public int hashCode() {
		int hashCode = numFields * 47;
		for (TypeSerializer<?> ser : this.fieldSerializers) {
			hashCode = (hashCode << 7) | (hashCode >>> -7);
			hashCode += ser.hashCode();
		}
		return hashCode;
	}
	
	@Override
	public boolean equals(Object obj) {
		if (obj != null && obj instanceof PojoSerializer) {
			PojoSerializer<?> otherTS = (PojoSerializer<?>) obj;
			return (otherTS.clazz == this.clazz) &&
					Arrays.deepEquals(this.fieldSerializers, otherTS.fieldSerializers);
		}
		else {
			return false;
		}
	}
}
