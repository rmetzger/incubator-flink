package org.apache.flink.annotation.utils;

import org.apache.flink.annotation.Experimental;
import org.apache.flink.annotation.Internal;
import org.apache.flink.annotation.Public;
import org.reflections.Reflections;

import java.lang.annotation.Annotation;
import java.lang.reflect.Method;
import java.lang.reflect.Modifier;
import java.lang.reflect.Parameter;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Collections;
import java.util.Comparator;
import java.util.List;

public class AnnotationsAnalyzer {
	protected void test() {
		//
	}

	public static void main(String[] args) {
		Reflections reflections = new Reflections("org.apache.flink");

	//	Set<String> s = reflections.getAllTypes();

		List<Class<?>> annotated = new ArrayList<>(reflections.getTypesAnnotatedWith(Public.class));
		Collections.sort(annotated, new Comparator<Class<?>>() {
			@Override
			public int compare(Class<?> o1, Class<?> o2) {
				return o1.getName().compareTo(o2.getName());
			}
		});

		for(Class t: annotated) {
			System.out.println("Class: " + t.getName());
			// get public methods:
			Method[] methods = t.getDeclaredMethods();
			Arrays.sort(methods, new Comparator<Method>() {
				@Override
				public int compare(Method o1, Method o2) {
					return o1.getName().compareTo(o2.getName());
				}
			});
			for(Method m : methods) {
				List<Annotation> annotations = Arrays.asList(m.getAnnotations());
				if(Modifier.isPublic(m.getModifiers()) &&
					!annotations.contains(Experimental.class) &&
					!annotations.contains(Internal.class)) {
					String params = "";
					for(Class p: m.getParameterTypes()) {
						params += p.getSimpleName();
					}
					System.out.println("\t " +
							m.getReturnType().getSimpleName() + " " +
							m.getName() +
							"(" + params + ")");

				}
			}


		}
	}
}
