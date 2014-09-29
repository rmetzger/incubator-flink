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

import org.apache.commons.lang3.Validate;
import org.apache.flink.api.common.typeinfo.AtomicType;
import org.apache.flink.api.common.typeinfo.TypeInformation;
import org.apache.flink.api.common.typeutils.TypeComparator;
import org.apache.flink.api.common.typeutils.TypeSerializer;
import org.apache.flink.api.java.typeutils.CompositeType.FlatFieldDescriptor;
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
public class PojoTypeInfo<T> extends CompositeType<T>{

	private final Class<T> typeClass;

	private PojoField[] fields;
	
	private int totalFields;
	
//	private List<FlatFieldDescriptor> flatSchema;

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
		for(PojoField field : fields) {
			totalFields += field.type.getTotalFields();
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
	public int getTotalFields() {
		return totalFields;
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
	
	@Override
	public FlatFieldDescriptor getKey(String fieldExpression, int offset) {
		Validate.notEmpty(fieldExpression, "Field expression must not be empty.");
		// if there is a dot try getting the field from that sub field
		int firstDot = fieldExpression.indexOf('.');
		if (firstDot == -1) {
			// this is the last field (or only field) in the field expression
			int fieldId = 0;
			for (int i = 0; i < fields.length; i++) {
				if(fields[i].type instanceof CompositeType) {
					fieldId += fields[i].type.getTotalFields()-1;
				}
				if (fields[i].field.getName().equals(fieldExpression)) {
					return new FlatFieldDescriptor(offset + fieldId, fields[i].type, null);
				}
				fieldId++;
			}
		} else {
			// split and go deeper
			String firstField = fieldExpression.substring(0, firstDot);
			String rest = fieldExpression.substring(firstDot + 1);
			int fieldId = 0;
			for (int i = 0; i < fields.length; i++) {
				if (fields[i].field.getName().equals(firstField)) {
					if (!(fields[i].type instanceof CompositeType<?>)) {
						throw new RuntimeException("Field "+fields[i].type+" is not composite type");
					}
					CompositeType<?> cType = (CompositeType<?>) fields[i].type;
					return cType.getKey(rest, offset + fieldId);
				}
				fieldId++;
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

	// used for testing. Maybe use mockito here
	public PojoField getPojoFieldAt(int pos) {
		if (pos < 0 || pos >= this.fields.length) {
			throw new IndexOutOfBoundsException();
		}
		return this.fields[pos];
	}

	public TypeComparator<T> createComparator(int[] logicalKeyFields, boolean[] orders) {
	//	checkFlatSchema();
		// sanity checks
		if (logicalKeyFields == null || orders == null || logicalKeyFields.length != orders.length ||
				logicalKeyFields.length > fields.length)
		{
			throw new IllegalArgumentException();
		}

		// create the comparators for the individual fields
		TypeComparator<?>[] fieldComparators = new TypeComparator<?>[logicalKeyFields.length];
		Field[] keyFields = new Field[logicalKeyFields.length];
		for (int i = 0; i < logicalKeyFields.length; i++) {
			int field = logicalKeyFields[i];

			if (field < 0 || field >= getTotalFields()) {
				throw new IllegalArgumentException("The field position " + field + " is out of range [0," + getTotalFields() + ")");
			}
		//	if(field >= getArity() )
			if(fields[field].type instanceof PojoTypeInfo<?>) {
				// handle pojo comparator for nested fields here
			}
			if (fields[field].type.isKeyType() && fields[field].type instanceof AtomicType) {
				fieldComparators[i] = ((AtomicType<?>) fields[field].type).createComparator(orders[i]);
				keyFields[i] = fields[field].field;
			} else {
				throw new IllegalArgumentException("The field at position " + field + " (" + fields[field].type + ") is no atomic key type.");
			}
		}

		return new PojoComparator<T>(keyFields, fieldComparators, createSerializer(), typeClass);
	}

/*	@SuppressWarnings("unchecked")
	@Override
	public TypeComparator<T> createComparator(boolean sortOrderAscending) {
	//	checkFlatSchema();
		if (isKeyType()) {
			@SuppressWarnings("rawtypes")
			GenericTypeComparator comparator = new GenericTypeComparator(sortOrderAscending, createSerializer(), this.typeClass);
			return (TypeComparator<T>) comparator;
		}

		throw new UnsupportedOperationException("Types that do not implement java.lang.Comparable cannot be used as keys.");
	} */

	@Override
	public TypeSerializer<T> createSerializer() {
	//	checkFlatSchema();
		TypeSerializer<?>[] fieldSerializers = new TypeSerializer<?>[fields.length ];
		Field[] reflectiveFields = new Field[fields.length];

		for (int i = 0; i < fields.length; i++) {
			fieldSerializers[i] = fields[i].type.createSerializer();
			reflectiveFields[i] = fields[i].field;
		}

		return new PojoSerializer<T>(this.typeClass, fieldSerializers, reflectiveFields);
	}

	
}
