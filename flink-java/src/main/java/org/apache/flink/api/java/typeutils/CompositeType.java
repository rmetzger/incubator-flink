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
import java.util.ArrayList;
import java.util.Collections;
import java.util.Comparator;
import java.util.List;

import org.apache.flink.api.common.typeinfo.AtomicType;
import org.apache.flink.api.common.typeinfo.TypeInformation;
import org.apache.flink.api.common.typeutils.TypeComparator;
import org.apache.flink.api.java.tuple.Tuple2;
import org.powermock.tests.utils.Keys;


/**
 * Type Information for Tuple and Pojo types
 * 
 * The class is taking care of serialization and comparators for Tuples as well.
 * See @see {@link Keys} class for fields setup.
 */
public abstract class CompositeType<T> extends TypeInformation<T> {
	
	protected final Class<T> typeClass;
	
	public CompositeType(Class<T> typeClass) {
		this.typeClass = typeClass;
	}
	
	/**
	 * Returns the keyPosition for the given fieldPosition, offsetted by the given offset
	 */
	public abstract void getKey(String fieldExpression, int offset, List<FlatFieldDescriptor> result);
	
	public abstract <X> TypeInformation<X> getTypeAt(int pos);
	
	/**
	 * Initializes the internal state inside a Composite type to create a new comparator 
	 * (such as the lists / arrays for the fields and field comparators)
	 * @param localKeyCount 
	 */
	protected abstract void initializeNewComparator(int localKeyCount);
	
	/**
	 * Add a field for comparison in this type.
	 */
	protected abstract void addCompareField(int fieldId, TypeComparator<?> comparator);
	
	/**
	 * Get the actual comparator we've initialized.
	 */
	protected abstract TypeComparator<T> getNewComparator();
	
	
	/**
	 * Generic implementation of the comparator creation. Composite types are supplying the infrastructure
	 * to create the actual comparators
	 * @return
	 */
	public TypeComparator<T> createComparator(int[] logicalKeyFields, boolean[] orders, int logicalFieldOffset) {
		initializeNewComparator(logicalKeyFields.length);
		
		for(int logicalKeyFieldIndex = 0; logicalKeyFieldIndex < logicalKeyFields.length; logicalKeyFieldIndex++) {
			int logicalKeyField = logicalKeyFields[logicalKeyFieldIndex];
			int logicalField = logicalFieldOffset; // this is the global/logical field number
			for(int localFieldId = 0; localFieldId < this.getArity(); localFieldId++) {
				TypeInformation<?> localFieldType = this.getTypeAt(localFieldId);
				
				if(localFieldType instanceof AtomicType && logicalField == logicalKeyField) {
					// we found an atomic key --> create comparator
					addCompareField(localFieldId, ((AtomicType) localFieldType).createComparator(orders[logicalKeyFieldIndex]) );
				} else if(localFieldType instanceof CompositeType  && // must be a composite type
						( logicalField <= logicalKeyField //check if keyField can be at or behind the current logicalField
						&& logicalKeyField <= logicalField + (localFieldType.getTotalFields() - 1) ) // check if logical field + lookahead could contain our key
						) {
					// we found a compositeType that is containing the logicalKeyField we are looking for --> create comparator
					addCompareField(localFieldId, ((CompositeType) localFieldType).createComparator(new int[] {logicalKeyField}, orders, logicalField));
				}
				
				// maintain logicalField
				if(localFieldType instanceof CompositeType) {
					// we need to subtract 1 because we are not accounting for the local field (not accessible for the user)
					logicalField += localFieldType.getTotalFields() - 1;
				}
				logicalField++;
			}
		}
		return getNewComparator();
	}
	
	
	
//	private static interface Walker {
//		abstract void field(int logicalField, int localFieldId, TypeInformation<?> fieldType);
//	}
//	
//	private void allLocalFieldsWalker(Walker w) {
//		int logicalField = logicalFieldOffset;
//		for(int localFieldId = 0; localFieldId < this.getArity(); localFieldId++) {
//			TypeInformation<?> localFieldType = this.getTypeAt(localFieldId);
//			w.field(logicalField, localFieldId, localFieldType);
//			if(localFieldType instanceof CompositeType) {
//				logicalField += localFieldType.getTotalFields() - 1;
//			}
//			logicalField++;
//		}
//	}
//	
//	// local key fields are atomic types which are created at this level
//	private List<LogicalKeyFieldDescriptor> localKeyFields;
//	
//	private int logicalFieldOffset = -1;
//	private int localAtomicKeyCount = -1;
//	private int localKeyCount = -1;
//	
//	
//	private void computeLocalKeyFields(final int[] logicalKeyFields) {
//		if(localAtomicKeyCount > 0) {
//			throw new IllegalStateException("This method has probably been called before");
//		}
//		if(logicalFieldOffset == -1 || localAtomicKeyCount == -1) { // we depend on this to be set up correctly
//			throw new IllegalStateException("The comparators have not been properly set up");
//		}
//		Walker computeLocalKeyFieldsWalker = new Walker() {
//			@Override
//			public void field(int logicalField, int localFieldId, TypeInformation<?> fieldType) {
//				for(int i = 0; i < logicalKeyFields.length; i++) {
//					if(logicalField == logicalKeyFields[i]) {
//						if(!(fieldType instanceof AtomicType)) {
//							throw new IllegalStateException("Can not be non-atomic");
//						}
//						LogicalKeyFieldDescriptor d = new LogicalKeyFieldDescriptor();
//						d.keyFieldPosition = i;
//						d.logicalKeyFieldId = logicalField;
//						localKeyFields.add(d);
//						localAtomicKeyCount++;
//					}
//				}
//			}
//		};
//		allLocalFieldsWalker(computeLocalKeyFieldsWalker);
//	}
//	// count local keys including composite ones.
//	private void countLocalKeys(final int[] logicalKeyFields) {
//	}
//	
//	private LogicalKeyFieldDescriptor getLocalKeyField(int logicalFieldId) {
//		for(LogicalKeyFieldDescriptor localKeyField : localKeyFields) {
//			if(logicalFieldId == localKeyField.logicalKeyFieldId) {
//				return localKeyField;
//			}
//		}
//		return null;
//	}
//	/**
//	 * Generic implementation of the comparator creation. Composite types are supplying the infrastructure
//	 * to create the actual comparators
//	 * @return
//	 */
//	public TypeComparator<T> createComparator(int[] logicalKeyFields, boolean[] orders, int logicalFieldOffset) {
//		
//		this.logicalFieldOffset = logicalFieldOffset;
//		int logicalField = logicalFieldOffset; // this is the global/logical field number
//		computeLocalKeyFields(logicalKeyFields);
//		
//		initializeNewComparator(localAtomicKeyCount);
//		
//		for(int localFieldId = 0; localFieldId < this.getArity(); localFieldId++) {
//			TypeInformation<?> localFieldType = this.getTypeAt(localFieldId);
//			
//			// test and see if  
//			LogicalKeyFieldDescriptor logicalKeyDescriptor = getLocalKeyField(logicalField);
//			if(logicalKeyDescriptor != null) {
//				if(! (localFieldType instanceof AtomicType)) {
//					// Composite types can never be comparison keys.
//					throw new IllegalStateException("This field has to be a atomic type");
//				}
//			}
//			if(localFieldType instanceof AtomicType && logicalField == logicalKeyField) {
//				// we found an atomic key --> create comparator
//				addCompareField(localFieldId, ((AtomicType) localFieldType).createComparator(orders[logicalKeyFieldIndex]) );
//			} else if(localFieldType instanceof CompositeType 
//					&& logicalField >= logicalKeyField
//					&& logicalField + (localFieldType.getTotalFields() - 1) <= logicalKeyField ) {
//				// we found a compositeType that is containing the logicalKeyField we are looking for --> create comparator
//				addCompareField(localFieldId, ((CompositeType) localFieldType).createComparator(null, null, logicalField));
//			}
//			
//			// maintain logicalField
//			if(localFieldType instanceof CompositeType) {
//				// we need to subtract 1 because we are not accounting for the local field (not accessible for the user)
//				logicalField += localFieldType.getTotalFields() - 1;
//			}
//			logicalField++;
//		}
//		return getNewComparator();
//	}
//	
//	public static class LogicalKeyFieldDescriptor {
//		public int logicalKeyFieldId;
//		public int keyFieldPosition;
//	}
//	

	
//	// TODO: we can remove this method.
//	public void populateWithFlatSchema(List<FlatFieldDescriptor> schema) {
//		this.flatSchema = schema;
//	//	List<PojoFieldAccessor> flatFieldsList = getFlattenedFields(new ArrayList<Field>());
//	}
//
//	private void checkFlatSchema() {
//		if(flatSchema == null) {
//		//	throw new RuntimeException("The composite type has not been populated with the flat schema types");
//			System.err.println("+++ Flat Schema not set. Setting it");
//			List<FlatFieldDescriptor> flatFields = new ArrayList<FlatFieldDescriptor>();
//			this.flatFieldsList = this.getFlatFields(new ArrayList<Field>(), flatFields, /* offset = */ 0);
//			debugFlatFieldList();
//			this.populateWithFlatSchema(flatFields);
//		}
//	}
//	private void debugFlatFieldList() {
//		for( PojoDirectFieldAccessor flatField: flatFieldsList) {
//			for(Field field: flatField.accessorChain) {
//				System.err.print(field.getName()+" ");
//			}
//			System.err.println("\n----");
//		}
//	}
	

	/**
	 * recursively get the FlatField descriptor
	 */
	//public abstract void getFlatFields(List<FlatFieldDescriptor> fields, int offset);

	/**
	 * Creates a flattened schema of the given pojo.
	 * 
	 * The number of elements in the flatFields list is exactly the total number of fields in the nested structure.
	 */
/*	public List<PojoDirectFieldAccessor> getFlatFields(List<Field> accessorChain, List<FlatFieldDescriptor> flatFields, int offset) {
		List<PojoDirectFieldAccessor> result = new ArrayList<PojoDirectFieldAccessor>();
		
		int offsetCounter = offset;
		for (int i = 0; i < this.getArity(); i++) {
			final TypeInformation<?> type = this.getTypeAt(i);
			if(type instanceof CompositeType<?>) { // actually CompositeType should be sufficient here. But the nasty Tuple / pojo separation forces me to go this way
				// handle recursion into nested fields.
				CompositeType<?> cType = (CompositeType<?>) type;
				final int beforeSize = flatFields.size();
				
				List<Field> newAccessorChain = new ArrayList<Field>();
				newAccessorChain.addAll(accessorChain);
				if(this instanceof PojoTypeInfo<?>) {
					PojoTypeInfo<?> thisPojo = (PojoTypeInfo<?>) this;
					newAccessorChain.add(thisPojo.getPojoFieldAt(i).field );
				} else if(this instanceof TupleTypeInfo) {
					TupleTypeInfo<?> thisPojo = (TupleTypeInfo<?>) this;
					// newAccessorChain.add(thisPojo.fields[i]);
				} else {
					throw new RuntimeException("Unable to get reflection field from this kind of TypeInfo");
				}
				
				result.addAll(cType.getFlatFields(newAccessorChain, flatFields, offsetCounter)); // recurse
				offsetCounter += flatFields.size() - beforeSize;
			} else {
				// handle fields in the same level
				Field reflectField = null;
				if(this instanceof PojoTypeInfo<?>) { // it might also be a TupleType
					PojoTypeInfo<?> pType = (PojoTypeInfo<?>) this;
					reflectField = pType.getPojoFieldAt(i).field;
				} else if(this instanceof TupleTypeInfo) {
					TupleTypeInfo<?> tType = (TupleTypeInfo<?>) this;
				//	reflectField = tType.fields[i];
				} else {
					throw new RuntimeException("Unable to get reflection field from this kind of TypeInfo");
				}
				
				if(reflectField == null) {
					throw new RuntimeException("The reflection field can not be null");
				}
				
				result.add(new PojoDirectFieldAccessor(accessorChain, reflectField, null)); // TODO: understand why null ;) (the actual question: why do we need the FlatFieldDesc here?
				flatFields.add(new FlatFieldDescriptor(offsetCounter, type, reflectField));
				
				offsetCounter++;
			}
		}
		
		return result;
	} */
	
	/**
	 * Create lists for accessing every field in the pojo
	 * Nested {
	 * 	String a_a;
	 * 	Long a_b;
	 * }
	 * CustomType{
	 * 	Nested a;
	 *  int b;
	 *  
	 *  This method returns 
	 *  [  	[a, a_a],
	 *  	[a, a_b],
	 *  	[b]
	 *  ]
	 *  
	 *  above method generates:
	 *  
	 *  [a_a, a_b, b]
	 *  
	 *  
	 *  If the user selects just "a" as the key, we have to fully deserialize "Nested" for comparison ??
	 *  right now, its impossible to represent this using the int-based offsets.
	 *  
	 * }
	 */
//	// aljoschas method
//	private final List<PojoFieldAccessor> getFlattenedFields(List<Field> accessorChain) {
//		List<PojoFieldAccessor> result = new ArrayList<PojoFieldAccessor>();
//
//		for (FlatFieldDescriptor field : flatSchema) {
//			if (field.type instanceof CompositeType) {
//			//	CompositeType<?> pojoField = (CompositeType<?>)field.type;
//				List<Field> newAccessorChain = new ArrayList<Field>();
//				newAccessorChain.addAll(accessorChain);
//				newAccessorChain.add(field.reflectField);
//				result.addAll(pojoField.getFlattenedFields(newAccessorChain));
//			} else {
//				result.add(new PojoFieldAccessor(accessorChain, field.reflectField, field));
//			}
//		}
//
//		return result;
//	}
	
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

	
	public static class FlatFieldDescriptor {
		private int keyPosition;
		private TypeInformation<?> type;
		
		public FlatFieldDescriptor(int keyPosition, TypeInformation<?> type) {
			if( !(type instanceof AtomicType)) {
				throw new IllegalArgumentException("A flattened field can only be an atomic type");
			}
			this.keyPosition = keyPosition;
			this.type = type;
		}


		public int getPosition() {
			return keyPosition;
		}
		public TypeInformation<?> getType() {
			return type;
		}
		
		@Override
		public String toString() {
			return "FlatFieldDescriptor [position="+keyPosition+" typeInfo="+type+"]";
		}
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
	
	public static int countPositiveInts(int[] in) {
		int res = 0;
		for(int i : in) {
			if(i >= 0) {
				res++;
			}
		}
		return res;
	}
	
}
