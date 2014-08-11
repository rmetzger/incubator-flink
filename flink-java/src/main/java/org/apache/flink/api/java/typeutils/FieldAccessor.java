package org.apache.flink.api.java.typeutils;


/**
 * Utility to access a field in a Pojo or Tuple
 */
public abstract class FieldAccessor {
	public abstract Object getField();
}
