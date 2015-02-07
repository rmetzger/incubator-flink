package org.apache.flink.runtime.metrics;

import com.codahale.metrics.Counter;
import com.codahale.metrics.Gauge;
import com.codahale.metrics.Metric;
import com.codahale.metrics.MetricRegistry;
import com.codahale.metrics.jvm.MemoryUsageGaugeSet;
import com.esotericsoftware.kryo.Kryo;
import com.esotericsoftware.kryo.io.Input;
import com.esotericsoftware.kryo.io.Output;
import de.javakaffee.kryoserializers.UnmodifiableCollectionsSerializer;

import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.util.Collections;
import java.util.HashMap;
import java.util.Map;

public class MetricsRegistryUtils {
	//final private String namePrefix;

/*	public MetricsRegistryUtils(String namePrefix) {
		this.namePrefix = namePrefix;
	} */



	/**
	 * Return serialized representation of the registry for sending it over
	 * the wire.
	 * @return
	 */
	private static Kryo kryo;
	public static byte[] serialize(Map<String, Metric> metrics) {
		if(kryo == null) {
			kryo = new Kryo();
		//	kryo.setRegistrationRequired(true); // ser size 1569 bytes.
			kryo.register(Collections.unmodifiableMap(new HashMap<Void, Void>()).getClass() );
			kryo.register(MemoryUsageGaugeSet.class);
			kryo.register(Gauge.class);
			kryo.register(Counter.class);
			UnmodifiableCollectionsSerializer.registerSerializers(kryo);
		}
		ByteArrayOutputStream baos = new ByteArrayOutputStream();
		Output out = new Output(baos);
		kryo.writeClassAndObject(out, metrics);
		out.flush();
		return baos.toByteArray();
	/*	try {
			ByteArrayOutputStream baos = new ByteArrayOutputStream();
			ObjectOutputStream oos = new ObjectOutputStream(baos);
			Map<String, Metric> metrics = this.getMetrics();
			oos.writeObject(metrics);
			return baos.toByteArray();
		} catch (IOException e) {
			e.printStackTrace();
		} */
	}

	public static Map<String, Metric> deserialize(byte[] ser) {
		ByteArrayInputStream bais = new ByteArrayInputStream(ser);
		Input in = new Input(bais);
		return (Map<String, Metric>) kryo.readClassAndObject(in);
	}


/*	@Override
	public <T extends Metric> T register(String name, T metric) throws IllegalArgumentException {
		return super.register(this.namePrefix + name, metric);
	}

	@Override
	public void registerAll(MetricSet metrics) throws IllegalArgumentException {
		registerAll(this.namePrefix, metrics);
	}

	// copied method.
	private void registerAll(String prefix, MetricSet metrics) throws IllegalArgumentException {
		for (Map.Entry<String, Metric> entry : metrics.getMetrics().entrySet()) {
			if (entry.getValue() instanceof MetricSet) {
				registerAll(name(prefix, entry.getKey()), (MetricSet) entry.getValue());
			} else {
				register(name(prefix, entry.getKey()), entry.getValue());
			}
		}
	}


	/*@Override
	public Counter counter(String name) {
		return super.counter(this.namePrefix + name);
	}

	@Override
	public Histogram histogram(String name) {
		return super.histogram(this.namePrefix + name);
	}

	@Override
	public Meter meter(String name) {
		return super.meter(this.namePrefix + name);
	}

	@Override
	public Timer timer(String name) {
		return super.timer(this.namePrefix + name);
	}

	@Override
	public boolean remove(String name) {
		return super.remove(this.namePrefix + name);
	}

	@Override
	public void removeMatching(final MetricFilter filter) {
		// delegate with namePrefix
		super.removeMatching(new MetricFilter() {
			@Override
			public boolean matches(String name, Metric metric) {
				return filter.matches(namePrefix + name, metric);
			}
		});
	}*/

}
