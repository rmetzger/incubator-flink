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

package org.apache.flink.api.java.typeutils;

import java.lang.reflect.Field;
import java.lang.reflect.Modifier;
import java.util.ArrayList;
import java.util.Collections;
import java.util.Comparator;
import java.util.List;

import org.apache.flink.api.common.typeinfo.AtomicType;
import org.apache.flink.api.common.typeinfo.CompositeType;
import org.apache.flink.api.common.typeinfo.TypeInformation;
import org.apache.flink.api.common.typeutils.TypeComparator;
import org.apache.flink.api.common.typeutils.TypeSerializer;
import org.apache.flink.api.java.typeutils.runtime.GenericTypeComparator;
import org.apache.flink.api.java.typeutils.runtime.PojoComparator;
import org.apache.flink.api.java.typeutils.runtime.PojoSerializer;

import com.google.common.base.Joiner;


/**
 * TypeInformation for arbitrary (they have to be java-beans-style) java objects (what we call POJO).
 * 
 * Information flow (For Pojos and Tuples)
 * 	User class	-> TypeExtractor	-> PojoTypeInfo (contains fields) 	-> CompositeType (flattened fields) -> Runtime
 * 		||	  	->		||	   		-> TupleTypeInfo 					-> 		||							-> Runtime
 */
public class PojoTypeInfo<T> extends CompositeType<T> implements AtomicType<T> {

	private final Class<T> typeClass;

	private PojoField[] fields;

//	private PojoFieldAccessor[] flattenedFields;

	public PojoTypeInfo(Class<T> typeClass, List<PojoField> fields) {
		super(typeClass);
		this.typeClass = typeClass;
		List<PojoField> tempFields = new ArrayList<PojoField>(fields);
		Collections.sort(tempFields, new Comparator<PojoField>() {
			@Override
			public int compare(PojoField o1, PojoField o2) {
				return o1.field.getName().compareTo(o2.field.getName());
			}
		});
		this.fields = tempFields.toArray(new PojoField[tempFields.size()]);
		
		// check if POJO is public
		if(!Modifier.isPublic(typeClass.getModifiers())) {
			throw new RuntimeException("POJO "+typeClass+" is not public");
		}
	}

	@Override
	public boolean isBasicType() {
		return false;
	}


	@Override
	public boolean isTupleType() {
		return false;
	}

	@Override
	public int getArity() {
		return fields.length;
	}

	@Override
	public Class<T> getTypeClass() {
		return typeClass;
	}

	@Override
	public boolean isKeyType() {
		return Comparable.class.isAssignableFrom(typeClass);
	}


	@Override
	public String toString() {
		List<String> fieldStrings = new ArrayList<String>();
		for (PojoField field : fields) {
			fieldStrings.add(field.field.getName() + ": " + field.type.toString());
		}
		return "PojoType<" + typeClass.getCanonicalName()
				+ ", fields = [" + Joiner.on(", ").join(fieldStrings) + "]"
				+ ">";
	}
	
	// The logical position can identify a field since we rely on the list
	// of flattened fields which is deterministic. We need the logical positions since this
	// is the only way to pass field positions to a comparator.
	// We return -1 in case we don't find the field. Keys.ExpressionKeys will handle this.
	@Override
	public FlatFieldDescriptor getKey(String fieldExpression, int offset) {
		Validate.notEmpty(fieldExpression, "Field expression must not be empty.");
		// if there is a dot try getting the field from that sub field
		int firstDot = fieldExpression.indexOf('.');
		if (firstDot == -1) {
			// this is the last field (or only field) in the field expression
			for (int i = 0; i < fields.length; i++) {
				if (fields[i].field.getName().equals(fieldExpression)) {
					return new FlatFieldDescriptor(i + offset, fields[i].type, null);
				}
			}
		} else {
			// split and go deeper
			String firstField = fieldExpression.substring(0, firstDot);
			String rest = fieldExpression.substring(firstDot + 1);
			for (int i = 0; i < fields.length; i++) {
				if (fields[i].field.getName().equals(firstField)) {
					if (!(fields[i].type instanceof CompositeType<?>)) {
						throw new RuntimeException("Field "+fields[i].type+" is not composite type");
					}
					CompositeType<?> cType = (CompositeType<?>) fields[i].type;
					return cType.getKey(rest, i + offset);
				}
			}
		}
		return null;
	}

	@Override
	public <X> TypeInformation<X> getTypeAt(int pos) {
		if (pos < 0 || pos >= this.fields.length) {
			throw new IndexOutOfBoundsException();
		}
		@SuppressWarnings("unchecked")
		TypeInformation<X> typed = (TypeInformation<X>) fields[pos].type;
		return typed;
	}

	public PojoField getPojoFieldAt(int pos) {
		if (pos < 0 || pos >= this.fields.length) {
			throw new IndexOutOfBoundsException();
		}
		return this.fields[pos];
	}


/*	@Override
	public void getTypes(List<TypeInformation<?>> types) {
		for (int i = 0; i < fieldExpression.length; i++) {
			result[i] = getType(fieldExpression[i]);
		}
		return result;
	} */

	// Flatten fields of inner pojo classes into one list with deterministic order so that
	// we can use it to derive logical key positions/
/*	private final List<PojoFieldAccessor> getFlattenedFields(List<Field> accessorChain) {
		List<PojoFieldAccessor> result = new ArrayList<PojoFieldAccessor>();

		for (PojoField field : fields) {
			if (field.type instanceof PojoTypeInfo) {
				PojoTypeInfo<?> pojoField = (PojoTypeInfo<?>)field.type;
				List<Field> newAccessorChain = new ArrayList<Field>();
				newAccessorChain.addAll(accessorChain);
				newAccessorChain.add(field.field);
				result.addAll(pojoField.getFlattenedFields(newAccessorChain));
			} else {
				result.add(new PojoFieldAccessor(accessorChain, field.field, field));
			}
		}

		return result;
	} */


	
}
