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

package org.apache.flink.api.common.typeinfo;

import java.lang.reflect.Field;
import java.util.ArrayList;
import java.util.List;

import org.apache.flink.api.common.typeutils.TypeComparator;
import org.apache.flink.api.common.typeutils.TypeSerializer;
import org.apache.flink.api.java.operators.Keys;
import org.apache.flink.api.java.tuple.Tuple;
import org.apache.flink.api.java.typeutils.CompositeType.FlatFieldDescriptor;
import org.apache.flink.api.java.typeutils.runtime.GenericTypeComparator;
import org.apache.flink.api.java.typeutils.runtime.PojoComparator;
import org.apache.flink.api.java.typeutils.runtime.PojoSerializer;
import org.apache.flink.api.java.typeutils.runtime.TupleLeadingFieldComparator;
import org.apache.flink.types.TypeInformation;

import com.google.common.base.Preconditions;


/**
 * Type Information for Tuple and Pojo types
 * 
 * The class is taking care of serialization and comparators for Tuples as well.
 * See @see {@link Keys} class for fields setup.
 */
public abstract class CompositeType<T> extends TypeInformation<T> implements AtomicType<T> {
	
	protected final Class<T> typeClass;

	private List<FlatFieldDescriptor> flatSchema;
	List<PojoDirectFieldAccessor> flatFieldsList;
	
//	/**
//	 * Pojo fields determined by the @see {@link TypeExtractor}.
//	 * Note that these fields only represent the types at this level of the type hierarchy.
//	 * The "flatSchema" field is the type info that is being used in the end.
//	 */
	private List<PojoField> pojoFields;
	
	public CompositeType(Class<T> typeClass) {
		this.typeClass = typeClass;
	}
	
	
	// TODO: we can remove this method.
	public void populateWithFlatSchema(List<FlatFieldDescriptor> schema) {
		this.flatSchema = schema;
	//	List<PojoFieldAccessor> flatFieldsList = getFlattenedFields(new ArrayList<Field>());
	}

	private void checkFlatSchema() {
		if(flatSchema == null) {
		//	throw new RuntimeException("The composite type has not been populated with the flat schema types");
			System.err.println("+++ Flat Schema not set. Setting it");
			List<FlatFieldDescriptor> flatFields = new ArrayList<FlatFieldDescriptor>();
			this.flatFieldsList = this.getFlatFields(new ArrayList<Field>(), flatFields, /* offset = */ 0);
			debugFlatFieldList();
			this.populateWithFlatSchema(flatFields);
		}
	}
	private void debugFlatFieldList() {
		for( PojoDirectFieldAccessor flatField: flatFieldsList) {
			for(Field field: flatField.accessorChain) {
				System.err.print(field.getName()+" ");
			}
			System.err.println("\n----");
		}
	}
	
	/**
	 * Returns the keyPosition for the given fieldPosition, offsetted by the given offset
	 */
	public abstract FlatFieldDescriptor getKey(String fieldExpression, int offset);
	
	public abstract <X> TypeInformation<X> getTypeAt(int pos);
	/**
	 * recursively get the FlatField descriptor
	 */
	//public abstract void getFlatFields(List<FlatFieldDescriptor> fields, int offset);

	/**
	 * Creates a flattened schema of the given pojo.
	 * 
	 * The number of elements in the flatFields list is exactly the total number of fields in the nested structure.
	 */
	public List<PojoDirectFieldAccessor> getFlatFields(List<Field> accessorChain, List<FlatFieldDescriptor> flatFields, int offset) {
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
	}
	
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
	
	public TypeComparator<T> createComparator(int[] logicalKeyFields, boolean[] orders) {
		checkFlatSchema();
		// sanity checks
		if (logicalKeyFields == null || orders == null || logicalKeyFields.length != orders.length ||
				logicalKeyFields.length > flatSchema.size())
		{
			throw new IllegalArgumentException();
		}
		
//		// special case for tuples where field zero is the key field
//		if (typeClass.isAssignableFrom(Tuple.class) && logicalKeyFields.length == 1 && logicalKeyFields[0] == 0) {
//			return createLeadingFieldComparator(orders[0], (TypeInformation) flatSchema.get(0).getType() ); // TypeInfo cast is disabling generics check for tuple type here.
//		}

		// create the comparators for the individual fields
		TypeComparator<?>[] fieldComparators = new TypeComparator<?>[logicalKeyFields.length];
		List<Field>[] keyFields = new List[logicalKeyFields.length];
		for (int i = 0; i < logicalKeyFields.length; i++) {
			int field = logicalKeyFields[i];

			if (field < 0 || field >= flatSchema.size()) {
				throw new IllegalArgumentException("The field position " + field + " is out of range [0," + flatSchema.size() + ")");
			}
			if (flatSchema.get(field).type.isKeyType() && flatSchema.get(field).type instanceof AtomicType) {
				fieldComparators[i] = ((AtomicType<?>) flatSchema.get(field).type).createComparator(orders[i]);
				keyFields[i] = flatFieldsList.get(field).accessorChain;
				for (Field accessedField : keyFields[i]) {
					accessedField.setAccessible(true);
				}
			} else {
				throw new IllegalArgumentException("The field at position " + field + " (" + flatSchema.get(field).type + ") is no atomic key type.");
			}
		}

		return new PojoComparator<T>(keyFields, fieldComparators, createSerializer(), typeClass);
	}

	@SuppressWarnings("unchecked")
	@Override
	public TypeComparator<T> createComparator(boolean sortOrderAscending) {
		checkFlatSchema();
		if (isKeyType()) {
			@SuppressWarnings("rawtypes")
			GenericTypeComparator comparator = new GenericTypeComparator(sortOrderAscending, createSerializer(), this.typeClass);
			return (TypeComparator<T>) comparator;
		}

		throw new UnsupportedOperationException("Types that do not implement java.lang.Comparable cannot be used as keys.");
	}

	@Override
	public TypeSerializer<T> createSerializer() {
		checkFlatSchema();
		TypeSerializer<?>[] fieldSerializers = new TypeSerializer<?>[flatSchema.size() ];
		Field[] reflectiveFields = new Field[flatSchema.size()];

		for (int i = 0; i < flatSchema.size(); i++) {
			fieldSerializers[i] = flatSchema.get(i).getType().createSerializer();
			reflectiveFields[i] = flatSchema.get(i).getReflectionField();
		}

		return new PojoSerializer<T>(this.typeClass, fieldSerializers, reflectiveFields);
	}
	
	

	
	
	public static class FlatFieldDescriptor {
		private int pos;
		private TypeInformation<?> type;
		private Field reflectField; // may be null if type == TupleTypeInfo
		
		public FlatFieldDescriptor(int pos, TypeInformation<?> type, Field reflectField) {
			this.pos = pos;
			this.type = type;
			this.reflectField = reflectField;
//			if(reflectField == null && !(type instanceof TupleTypeInfo<?>)) {
//				throw new IllegalArgumentException("Reflect field can not be null if type is not a tuple");
//			}
		}

		public Field getReflectionField() {
			return reflectField;
		}

		public int getPosition() {
			return pos;
		}
		public TypeInformation<?> getType() {
			return type;
		}
		
		@Override
		public String toString() {
			return "FlatFieldDescriptor [position="+pos+" typeInfo="+type+" reflectionField="+reflectField+"]";
		}
	}
	
}
