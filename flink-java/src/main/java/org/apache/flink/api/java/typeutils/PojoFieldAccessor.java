package org.apache.flink.api.java.typeutils;

import java.lang.reflect.Field;

public class PojoFieldAccessor extends FieldAccessor {
	
	Field field;
	Object base;
	
	@Override
	public Object getField() {
		try {
			return field.get(base);
		} catch (Throwable e) {
			throw new RuntimeException("Error", e);
		}
	}

}
