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

import java.lang.reflect.Array;
import java.lang.reflect.Field;
import java.lang.reflect.Modifier;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Collections;
import java.util.Comparator;
import java.util.List;

import org.apache.commons.lang3.Validate;
import org.apache.flink.api.common.typeinfo.AtomicType;
import org.apache.flink.api.common.typeinfo.TypeInformation;
import org.apache.flink.api.common.typeutils.TypeComparator;
import org.apache.flink.api.common.typeutils.TypeSerializer;
import org.apache.flink.api.java.operators.Keys.ExpressionKeys;
import org.apache.flink.api.java.tuple.Tuple2;
import org.apache.flink.api.java.typeutils.CompositeType.FlatFieldDescriptor;
import org.apache.flink.api.java.typeutils.runtime.GenericTypeComparator;
import org.apache.flink.api.java.typeutils.runtime.PojoComparator;
import org.apache.flink.api.java.typeutils.runtime.PojoSerializer;

import com.google.common.base.Joiner;
import com.google.common.primitives.Ints;


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
	public void getKey(String fieldExpression, int offset, List<FlatFieldDescriptor> result) {
		// handle 'select all' first
		if(fieldExpression.equals(ExpressionKeys.SELECT_ALL_CHAR)) {
			int keyPosition = 0;
			for(PojoField field : fields) {
				if(field.type instanceof AtomicType) {
					result.add(new FlatFieldDescriptor(offset + keyPosition, field.type));
				} else if(field.type instanceof CompositeType) {
					CompositeType<?> cType = (CompositeType<?>)field.type;
					cType.getKey(String.valueOf(ExpressionKeys.SELECT_ALL_CHAR), offset + keyPosition, result);
					keyPosition += cType.getTotalFields()-1;
				} else {
					throw new RuntimeException("Unexpected key type: "+field.type);
				}
				keyPosition++;
			}
			return;
		}
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
					 result.add(new FlatFieldDescriptor(offset + fieldId, fields[i].type));
					 return;
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
					cType.getKey(rest, offset + fieldId, result); // recurse
					return;
				}
				fieldId++;
			}
			throw new RuntimeException("Unable to find field "+fieldExpression+" in type "+this+" (looking for '"+firstField+"')");
		}
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

	public TypeComparator<T> createComparator(int[] logicalKeyFields, boolean[] orders, int offset) {
	//	checkFlatSchema();
		// sanity checks
		int totalNumberOfKeys = countPositiveInts(logicalKeyFields);
		int logicalKeyFieldsLength = countPositiveInts(logicalKeyFields);
		if (logicalKeyFields == null || orders == null || logicalKeyFieldsLength != orders.length)
		{
			throw new IllegalArgumentException();
		}
		// TODO add more sanity checks
		
		// these two arrays might contain null positions. We'll remove the null fields in the end
		TypeComparator<?>[] fieldComparators = new TypeComparator<?>[logicalKeyFieldsLength];
		Field[] keyFields = new Field[logicalKeyFieldsLength];
		
		// "logicalKeyFields" and "orders"
		int keyPosition = offset; // offset for "global" key fields
		for(PojoField field : fields) {
			// create comparators:
			Tuple2<Integer, Integer> c = nextKeyField(logicalKeyFields); //remove them for later comparators
			if(c == null || c.f0 == -1) {
				// all key fields have been set to -1
				break;
			}
			int keyIndex = c.f0;
			int arrayIndex = c.f1;
			
			// check if this field contains the key.
			if(field.type instanceof CompositeType && keyPosition + field.type.getTotalFields() - 1 >= keyIndex) { // was: keyPosition (TODO: maybe ke
				// we are at a composite type and need to go deeper.
				CompositeType<?> cType = (CompositeType<?>)field.type;
				keyFields[arrayIndex] = field.field;
				fieldComparators[arrayIndex] = cType.createComparator(logicalKeyFields, orders, keyPosition);
				logicalKeyFields[arrayIndex] = -1; // invalidate keyfield.
			} else if(keyIndex == keyPosition) {
				// we are at an atomic type and need to create a comparator here.
				keyFields[arrayIndex] = field.field;
				if(field.type instanceof AtomicType) { // The field has to be an atomic type
					fieldComparators[arrayIndex] = ((AtomicType<?>)field.type).createComparator(orders[arrayIndex]);
					logicalKeyFields[arrayIndex] = -1; // invalidate keyfield.
				} else {
					throw new RuntimeException("Unexpected key type: "+field.type+"."); // in particular, field.type should not be a CompositeType here.
				}
			}
			
			// maintain indexes:
			if(field.type instanceof CompositeType) {
				// skip key positions.
				keyPosition += ((CompositeType<?>)field.type).getTotalFields()-1;
			}
			keyPosition++;
		}
		totalNumberOfKeys = totalNumberOfKeys-countPositiveInts(logicalKeyFields);
		System.err.println("Total number of keys "+totalNumberOfKeys);
		return new PojoComparator<T>( removeNullFieldsFromArray(keyFields, Field.class), removeNullFieldsFromArray(fieldComparators, TypeComparator.class), createSerializer(), typeClass, totalNumberOfKeys);
	}
	
	/**
	 * Shrink array by removing null fields.
	 * @param in
	 * @return
	 */
	@SuppressWarnings("unchecked")
	public static <R> R[] removeNullFieldsFromArray(R[] in, Class<?> clazz) {
		List<R> elements = new ArrayList<R>();
		for(R e: in) {
			if(e != null) {
				elements.add(e);
			}
		}
		return elements.toArray((R[]) Array.newInstance(clazz, 1));
	}
	
	/**
	 * Returns the lowest key in the incoming array.
	 * @param check
	 * @param intArr
	 * @return Tuple2 with keyIndex and position inside array.
	 */
	public static Tuple2<Integer, Integer> nextKeyField(int[] intArr) {
		if(intArr.length == 0) {
			return null;
		}
		List<Tuple2<Integer, Integer>> res = new ArrayList<Tuple2<Integer, Integer>>(intArr.length);
		for(int i = 0; i < intArr.length; i++) {
			res.add(new Tuple2<Integer, Integer>(intArr[i], i));
		}
		Collections.sort(res, new Comparator<Tuple2<Integer, Integer>>() {
			@Override
			// This comparator sorts integers with the lowest first,
			// BUT the -1's to the end.
			public int compare(Tuple2<Integer, Integer> o1,
					Tuple2<Integer, Integer> o2) {
				if(o1.f0 == o2.f0) {
					return 0;
				}
				if(o1.f0 == -1) {
					return 1;
				}
				if(o2.f0 == -1) {
					return -1;
				}
				return o1.f0.compareTo(o2.f0);
			}
		});
		
		return res.get(0);
	}
	public static int countPositiveInts(int[] in) {
		int res = 0;
		for(int i : in) {
			if(i >= 0) {
				res++;
			}
		}
		return res;
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
