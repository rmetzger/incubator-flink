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

import java.util.Arrays;

import org.apache.flink.api.common.typeinfo.BasicTypeInfo;
import org.apache.flink.api.common.typeinfo.TypeInformation;
import org.apache.flink.api.common.typeutils.TypeComparator;
import org.apache.flink.api.common.typeutils.TypeSerializer;
//CHECKSTYLE.OFF: AvoidStarImport - Needed for TupleGenerator
import org.apache.flink.api.java.tuple.Tuple;
//CHECKSTYLE.ON: AvoidStarImport
import org.apache.flink.api.java.tuple.Tuple1;
import org.apache.flink.api.java.tuple.Tuple10;
import org.apache.flink.api.java.tuple.Tuple11;
import org.apache.flink.api.java.tuple.Tuple12;
import org.apache.flink.api.java.tuple.Tuple13;
import org.apache.flink.api.java.tuple.Tuple14;
import org.apache.flink.api.java.tuple.Tuple15;
import org.apache.flink.api.java.tuple.Tuple16;
import org.apache.flink.api.java.tuple.Tuple17;
import org.apache.flink.api.java.tuple.Tuple18;
import org.apache.flink.api.java.tuple.Tuple19;
import org.apache.flink.api.java.tuple.Tuple2;
import org.apache.flink.api.java.tuple.Tuple20;
import org.apache.flink.api.java.tuple.Tuple21;
import org.apache.flink.api.java.tuple.Tuple22;
import org.apache.flink.api.java.tuple.Tuple23;
import org.apache.flink.api.java.tuple.Tuple24;
import org.apache.flink.api.java.tuple.Tuple25;
import org.apache.flink.api.java.tuple.Tuple3;
import org.apache.flink.api.java.tuple.Tuple4;
import org.apache.flink.api.java.tuple.Tuple5;
import org.apache.flink.api.java.tuple.Tuple6;
import org.apache.flink.api.java.tuple.Tuple7;
import org.apache.flink.api.java.tuple.Tuple8;
import org.apache.flink.api.java.tuple.Tuple9;
import org.apache.flink.api.java.typeutils.runtime.TupleComparator;
import org.apache.flink.api.java.typeutils.runtime.TupleSerializer;




public final class TupleTypeInfo<T extends Tuple> extends TupleTypeInfoBase<T> {
	
	@SuppressWarnings("unchecked")
	public TupleTypeInfo(TypeInformation<?>... types) {
		this((Class<T>) CLASSES[types.length - 1], types);
	}

	public TupleTypeInfo(Class<T> tupleType, TypeInformation<?>... types) {
		super(tupleType, types);
		if (types == null || types.length == 0 || types.length > Tuple.MAX_ARITY) {
			throw new IllegalArgumentException();
		}
	}

	@Override
	public TupleSerializer<T> createSerializer() {
		TypeSerializer<?>[] fieldSerializers = new TypeSerializer<?>[getArity()];
		for (int i = 0; i < types.length; i++) {
			fieldSerializers[i] = types[i].createSerializer();
		}
		
		Class<T> tupleClass = getTypeClass();
		
		return new TupleSerializer<T>(tupleClass, fieldSerializers);
	}
	
	/**
	 * Comparator creation
	 */
	private TypeSerializer<?>[] fieldSerializers;
	private TypeComparator<?>[] fieldComparators;
	private int[] logicalKeyFields;
	private int comparatorHelperIndex = 0;
	
	@Override
	protected void initializeNewComparator(int localKeyCount) {
		fieldSerializers = new TypeSerializer[localKeyCount];
		fieldComparators = new TypeComparator<?>[localKeyCount];
		logicalKeyFields = new int[localKeyCount];
		comparatorHelperIndex = 0;
	}

	@Override
	protected void addCompareField(int fieldId, TypeComparator<?> comparator) {
		fieldComparators[comparatorHelperIndex] = comparator;
		fieldSerializers[comparatorHelperIndex] = types[fieldId].createSerializer();
		logicalKeyFields[comparatorHelperIndex] = fieldId;
		comparatorHelperIndex++;
	}

	@Override
	protected TypeComparator<T> getNewComparator() {
		final TypeComparator[] finalFieldComparators = Arrays.copyOf(fieldComparators, comparatorHelperIndex);
		final int[] finalLogicalKeyFields = Arrays.copyOf(logicalKeyFields, comparatorHelperIndex);
		final TypeSerializer[] finalFieldSerializers = Arrays.copyOf(fieldSerializers, comparatorHelperIndex);
		if(finalFieldComparators.length == 0 || finalLogicalKeyFields.length == 0 || finalFieldSerializers.length == 0 
				|| finalFieldComparators.length != finalLogicalKeyFields.length ||
				finalFieldComparators.length !=	finalFieldSerializers.length) {
			throw new IllegalArgumentException("Tuple comparator creation has a bug");
		}
		return new TupleComparator<T>(finalLogicalKeyFields, finalFieldComparators, finalFieldSerializers);
	}
	
//	public TypeComparator<T> createComparator(int[] logicalKeyFields, boolean[] orders, int offset) {
//		// sanity checks
//		final int maxPossibleKeyCount = countPositiveInts(logicalKeyFields);
//		int totalNumberOfKeys = maxPossibleKeyCount;
//		
//		int[] localLogicalKeyFields = new int[maxPossibleKeyCount];
//		TypeSerializer<?>[] fieldSerializers = new TypeSerializer[maxPossibleKeyCount];
//		
//		if (logicalKeyFields == null || orders == null || logicalKeyFields.length != orders.length)
//		{
//			throw new IllegalArgumentException();
//		}
//		
//		// these two arrays might contain null positions. We'll remove the null fields in the end
//		TypeComparator<?>[] fieldComparators = new TypeComparator<?>[maxPossibleKeyCount];
//		
//		int keyPosition = offset; // offset for "global" key fields
//		int i = 0;
//		for(TypeInformation<?> type : types) {
//			// create comparators:
//			Tuple2<Integer, Integer> c = nextKeyField(logicalKeyFields); //remove them for later comparators
//			if(c == null || c.f0 == -1) {
//				// all key fields have been set to -1
//				break;
//			}
//			int keyIndex = c.f0;
//			int arrayIndex = c.f1;
//			
//			// check if this field contains the key.
//			if(type instanceof CompositeType && keyPosition + type.getTotalFields() - 1 >= keyIndex) {
//				// we are at a composite type and need to go deeper.
//				CompositeType<?> cType = (CompositeType<?>)type;
//				fieldComparators[arrayIndex] = cType.createComparator(logicalKeyFields, orders, keyPosition);
//				logicalKeyFields[arrayIndex] = -1; // invalidate keyfield.
//				localLogicalKeyFields[arrayIndex] = i;
//				fieldSerializers[arrayIndex] = cType.createSerializer();
//			} else if(keyIndex == keyPosition) {
//				// we are at an atomic type and need to create a comparator here.
//				if(type instanceof AtomicType) { // The field has to be an atomic type
//					fieldComparators[arrayIndex] = ((AtomicType<?>)type).createComparator(orders[arrayIndex]);
//					logicalKeyFields[arrayIndex] = -1; // invalidate keyfield.
//					localLogicalKeyFields[arrayIndex] = i;
//					fieldSerializers[arrayIndex] = type.createSerializer();
//				} else {
//					throw new RuntimeException("Unexpected key type: "+type+"."); // in particular, field.type should not be a CompositeType here.
//				}
//			}
//			
//			// maintain indexes:
//			if(type instanceof CompositeType) {
//				// skip key positions.
//				keyPosition += ((CompositeType<?>)type).getTotalFields()-1;
//			}
//			keyPosition++;
//			i++;
//		}
//		totalNumberOfKeys = totalNumberOfKeys-countPositiveInts(logicalKeyFields); // TODO this does not make sense at the top level total number of keys might me lower (imagine 10 keys in a sub-comparator.
//		// the logical key fields will not reflect this. Maybe just count the field comparators?
//		localLogicalKeyFields = Arrays.copyOf(localLogicalKeyFields, totalNumberOfKeys);
//		return new TupleComparator<T>(localLogicalKeyFields, removeNullFieldsFromArray(fieldComparators, TypeComparator.class), 
//				removeNullFieldsFromArray(fieldSerializers, TypeSerializer.class), totalNumberOfKeys);
//	}
	
	
	
//	@Override
//	public TypeComparator<T> createComparator(int[] logicalKeyFields, boolean[] orders, int offset) {
//		// sanity checks
//		if (logicalKeyFields == null || orders == null || logicalKeyFields.length != orders.length ||
//				logicalKeyFields.length > types.length)
//		{
//			throw new IllegalArgumentException();
//		}
//
//		int maxKey = -1;
//		for (int key : logicalKeyFields){
//			maxKey = Math.max(key, maxKey);
//		}
//		
//		if (maxKey >= this.types.length) {
//			throw new IllegalArgumentException("The key position " + maxKey + " is out of range for Tuple" + types.length);
//		}
//		
//		// create the comparators for the individual fields
//		TypeComparator<?>[] fieldComparators = new TypeComparator<?>[logicalKeyFields.length];
//		for (int i = 0; i < logicalKeyFields.length; i++) {
//			int keyPos = logicalKeyFields[i];
//			if (types[keyPos].isKeyType() && types[keyPos] instanceof AtomicType) {
//				fieldComparators[i] = ((AtomicType<?>) types[keyPos]).createComparator(orders[i]);
//			} else if(types[keyPos].isTupleType() && types[keyPos] instanceof TupleTypeInfo){ // Check for tuple
//				TupleTypeInfo<?> tupleType = (TupleTypeInfo<?>) types[keyPos];
//				
//				// All fields are key
//				int[] allFieldsKey = new int[tupleType.types.length];
//				for(int h = 0; h < tupleType.types.length; h++){
//					allFieldsKey[h]=h;
//				}
//				
//				// Prepare order
//				boolean[] tupleOrders = new boolean[tupleType.types.length];
//				Arrays.fill(tupleOrders, orders[i]);
//				fieldComparators[i] = tupleType.createComparator(allFieldsKey, tupleOrders, offset + keyPos);
//			} else {
//				throw new IllegalArgumentException("The field at position " + i + " (" + types[keyPos] + ") is no atomic key type nor tuple type.");
//			}
//		}
//		
//		// create the serializers for the prefix up to highest key position
//		TypeSerializer<?>[] fieldSerializers = new TypeSerializer<?>[maxKey + 1];
//		for (int i = 0; i <= maxKey; i++) {
//			fieldSerializers[i] = types[i].createSerializer();
//		}
//		
//		return new TupleComparator<T>(logicalKeyFields, fieldComparators, fieldSerializers);
//	}

	

	
	// --------------------------------------------------------------------------------------------
	
	@Override
	public boolean equals(Object obj) {
		if (obj instanceof TupleTypeInfo) {
			@SuppressWarnings("unchecked")
			TupleTypeInfo<T> other = (TupleTypeInfo<T>) obj;
			return ((this.tupleType == null && other.tupleType == null) || this.tupleType.equals(other.tupleType)) &&
					Arrays.deepEquals(this.types, other.types);
			
		} else {
			return false;
		}
	}
	
	@Override
	public int hashCode() {
		return this.types.hashCode() ^ Arrays.deepHashCode(this.types);
	}
	
	@Override
	public String toString() {
		return "Java " + super.toString();
	}

	// --------------------------------------------------------------------------------------------
	
	public static <X extends Tuple> TupleTypeInfo<X> getBasicTupleTypeInfo(Class<?>... basicTypes) {
		if (basicTypes == null || basicTypes.length == 0) {
			throw new IllegalArgumentException();
		}
		
		TypeInformation<?>[] infos = new TypeInformation<?>[basicTypes.length];
		for (int i = 0; i < infos.length; i++) {
			Class<?> type = basicTypes[i];
			if (type == null) {
				throw new IllegalArgumentException("Type at position " + i + " is null.");
			}
			
			TypeInformation<?> info = BasicTypeInfo.getInfoFor(type);
			if (info == null) {
				throw new IllegalArgumentException("Type at position " + i + " is not a basic type.");
			}
			infos[i] = info;
		}
		
		@SuppressWarnings("unchecked")
		TupleTypeInfo<X> tupleInfo = (TupleTypeInfo<X>) new TupleTypeInfo<Tuple>(infos);
		return tupleInfo;
	}

	// --------------------------------------------------------------------------------------------	
	// The following lines are generated.
	// --------------------------------------------------------------------------------------------
	
	// BEGIN_OF_TUPLE_DEPENDENT_CODE	
	// GENERATED FROM org.apache.flink.api.java.tuple.TupleGenerator.
	private static final Class<?>[] CLASSES = new Class<?>[] {
		Tuple1.class, Tuple2.class, Tuple3.class, Tuple4.class, Tuple5.class, Tuple6.class, Tuple7.class, Tuple8.class, Tuple9.class, Tuple10.class, Tuple11.class, Tuple12.class, Tuple13.class, Tuple14.class, Tuple15.class, Tuple16.class, Tuple17.class, Tuple18.class, Tuple19.class, Tuple20.class, Tuple21.class, Tuple22.class, Tuple23.class, Tuple24.class, Tuple25.class
	};
	// END_OF_TUPLE_DEPENDENT_CODE
}
