package org.apache.flink.runtime.util;

import org.slf4j.Logger;
import sun.misc.Signal;

/**
 * This signal handler / signal logger is based on Apache Hadoops org.apache.hadoop.util.SignalLogger.
 */
public class SignalHandler {
	private static boolean registered = false;

	/**
	 * Our signal handler.
	 */
	private static class Handler implements sun.misc.SignalHandler {
		final private Logger LOG;
		final private sun.misc.SignalHandler prevHandler;

		Handler(String name, Logger LOG) {
			this.LOG = LOG;
			prevHandler = Signal.handle(new Signal(name), this);
		}

		/**
		 * Handle an incoming signal.
		 *
		 * @param signal    The incoming signal
		 */
		@Override
		public void handle(Signal signal) {
			LOG.error("RECEIVED SIGNAL " + signal.getNumber() + ": SIG" + signal.getName());
			prevHandler.handle(signal);
		}
	}

	/**
	 * Register some signal handlers.
	 *
	 * @param LOG The slf4j logger
	 */
	public static void register(final Logger LOG) {
		if (registered) {
			throw new IllegalStateException("Can't re-install the signal handlers.");
		}
		registered = true;
		StringBuilder bld = new StringBuilder();
		bld.append("registered UNIX signal handlers for [");
		final String SIGNALS[] = { "TERM", "HUP", "INT" };
		String separator = "";
		for (String signalName : SIGNALS) {
			try {
				new Handler(signalName, LOG);
				bld.append(separator);
				bld.append(signalName);
				separator = ", ";
			} catch (Exception e) {
				LOG.debug("Error while registering signal handler", e);
			}
		}
		bld.append("]");
		LOG.info(bld.toString());
	}
}
