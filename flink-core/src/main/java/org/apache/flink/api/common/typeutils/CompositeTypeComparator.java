package org.apache.flink.api.common.typeutils;

import java.util.LinkedList;
import java.util.List;

public abstract class CompositeTypeComparator<T> extends TypeComparator<T> {
	
	private static final long serialVersionUID = 1L;

	@Override
	public TypeComparator[] getFlatComparators() {
		List<TypeComparator> flatComparators = new LinkedList<TypeComparator>();
		this.getFlatComparator(flatComparators);
		return flatComparators.toArray(new TypeComparator[flatComparators.size()]);
	}
	
	public abstract void getFlatComparator(List<TypeComparator> flatComparators);
}
