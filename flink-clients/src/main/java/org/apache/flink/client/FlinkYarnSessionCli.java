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
package org.apache.flink.client;

import org.apache.commons.cli.CommandLine;
import org.apache.commons.cli.CommandLineParser;
import org.apache.commons.cli.HelpFormatter;
import org.apache.commons.cli.Option;
import org.apache.commons.cli.Options;
import org.apache.commons.cli.PosixParser;
import org.apache.commons.lang3.StringUtils;
import org.apache.flink.runtime.operators.sort.ExceptionHandler;
import org.apache.flink.runtime.yarn.AbstractFlinkYarnClient;
import org.apache.flink.runtime.yarn.AbstractFlinkYarnCluster;
import org.apache.flink.runtime.yarn.FlinkYarnClusterStatus;
import org.apache.flink.util.InstantiationUtil;
import org.apache.hadoop.fs.Path;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.io.BufferedReader;
import java.io.File;
import java.io.FileOutputStream;
import java.io.FilenameFilter;
import java.io.IOException;
import java.io.InputStreamReader;
import java.io.OutputStream;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.Properties;

/**
 * Class handling the command line interface to the YARN session.
 */
public class FlinkYarnSessionCli {
	private static final Logger LOG = LoggerFactory.getLogger(FlinkYarnSessionCli.class);


	//------------------------------------ Constants   -------------------------

	private static final String CONFIG_FILE_NAME = "flink-conf.yaml";
	public static final String CONFIG_FILE_LOGBACK_NAME = "logback.xml";
	public static final String CONFIG_FILE_LOG4J_NAME = "log4j.properties";

	private static final String DEFAULT_QUEUE_NAME = "default";

	private static final int CLIENT_POLLING_INTERVALL = 3;

	//------------------------------------ Command Line argument options -------------------------
	private static final Option QUERY = new Option("q","query",false, "Display available YARN resources (memory, cores)");
	// --- or ---
	private static final Option VERBOSE = new Option("v","verbose",false, "Verbose debug mode");
	private static final Option QUEUE = new Option("qu","queue",true, "Specify YARN queue.");
	private static final Option SHIP_PATH = new Option("t","ship",true, "Ship files in the specified directory (t for transfer)");
	private static final Option FLINK_JAR = new Option("j","jar",true, "Path to Flink jar file");
	private static final Option JM_MEMORY = new Option("jm","jobManagerMemory",true, "Memory for JobManager Container [in MB]");
	private static final Option TM_MEMORY = new Option("tm","taskManagerMemory",true, "Memory per TaskManager Container [in MB]");
	private static final Option CONTAINER = new Option("n","container",true, "Number of YARN container to allocate (=Number of"
			+ " Task Managers)");
	private static final Option SLOTS = new Option("s","slots",true, "Number of slots per TaskManager");

	/**
	 * Dynamic properties allow the user to specify additional configuration values with -D, such as
	 *  -Dfs.overwrite-files=true  -Dtaskmanager.network.numberOfBuffers=16368
	 */
	private static final Option DYNAMIC_PROPERTIES = new Option("D", true, "Dynamic properties");

	public static AbstractFlinkYarnClient createFlinkYarnClient(CommandLine cmd) {

		AbstractFlinkYarnClient flinkYarnClient = getFlinkYarnClient();
		if(flinkYarnClient == null) {
			return null;
		}

		if(!cmd.hasOption(CONTAINER.getOpt())) { // number of containers is required option!
			LOG.error("Missing required argument " + CONTAINER.getOpt());
			printUsage();
			return null;
		}
		flinkYarnClient.setTaskManagerCount(Integer.valueOf(cmd.getOptionValue(CONTAINER.getOpt())));


		// Jar Path
		Path localJarPath;
		if(cmd.hasOption(FLINK_JAR.getOpt())) {
			String userPath = cmd.getOptionValue(FLINK_JAR.getOpt());
			if(!userPath.startsWith("file://")) {
				userPath = "file://" + userPath;
			}
			localJarPath = new Path(userPath);
		} else {
			localJarPath = new Path("file://"+flinkYarnClient.getClass().getProtectionDomain().getCodeSource().getLocation().getPath());
		}

		flinkYarnClient.setLocalJarPath(localJarPath);

		// Conf Path
		String confDirPath = CliFrontend.getConfigurationDirectoryFromEnv();
		flinkYarnClient.setConfigurationDirectory(confDirPath);
		File confFile = new File(confDirPath + File.separator + CONFIG_FILE_NAME);
		if(!confFile.exists()) {
			LOG.error("Unable to locate configuration file in "+confFile);
			return null;
		}
		Path confPath = new Path(confFile.getAbsolutePath());

		flinkYarnClient.setConfigurationFilePath(confPath);

		List<File> shipFiles = new ArrayList<File>();
		// path to directory to ship
		if(cmd.hasOption(SHIP_PATH.getOpt())) {
			String shipPath = cmd.getOptionValue(SHIP_PATH.getOpt());
			File shipDir = new File(shipPath);
			if(shipDir.isDirectory()) {
				shipFiles = new ArrayList<File>(Arrays.asList(shipDir.listFiles(new FilenameFilter() {
					@Override
					public boolean accept(File dir, String name) {
						return !(name.equals(".") || name.equals(".."));
					}
				})));
			} else {
				LOG.warn("Ship directory is not a directory. Ignoring it.");
			}
		}

		//check if there is a logback or log4j file
		if(confDirPath.length() > 0) {
			File logback = new File(confDirPath + File.pathSeparator + CONFIG_FILE_LOGBACK_NAME);
			if(logback.exists()) {
				shipFiles.add(logback);
				flinkYarnClient.setConfigurationFilePath(new Path(logback.toURI()));
			}
			File log4j = new File(confDirPath + File.pathSeparator + CONFIG_FILE_LOG4J_NAME);
			if(log4j.exists()) {
				shipFiles.add(log4j);
				if(flinkYarnClient.getFlinkLoggingConfigurationPath() != null) {
					// this means there is already a logback configuration file --> fail
					LOG.error("The configuration directory ('"+confDirPath+"') contains both LOG4J and Logback configuration files." +
							"Please delete or rename one of them.");
					return null;
				} // else
				flinkYarnClient.setConfigurationFilePath(new Path(log4j.toURI()));
			}
		}

		flinkYarnClient.setShipFiles(shipFiles);

		// queue
		String queue = DEFAULT_QUEUE_NAME;
		if(cmd.hasOption(QUEUE.getOpt())) {
			queue = cmd.getOptionValue(QUEUE.getOpt());
		}

		flinkYarnClient.setQueue(queue);

		// JobManager Memory
		if(cmd.hasOption(JM_MEMORY.getOpt())) {
			int jmMemory = Integer.valueOf(cmd.getOptionValue(JM_MEMORY.getOpt()));
			flinkYarnClient.setJobManagerMemory(jmMemory);
		}

		// Task Managers memory
		if(cmd.hasOption(TM_MEMORY.getOpt())) {
			int tmMemory = Integer.valueOf(cmd.getOptionValue(TM_MEMORY.getOpt()));
			flinkYarnClient.setTaskManagerMemory(tmMemory);
		}


		if(cmd.hasOption(SLOTS.getOpt())) {
			int slots = Integer.valueOf(cmd.getOptionValue(SLOTS.getOpt()));
			flinkYarnClient.setTaskManagerSlots(slots);
		}

		String[] dynamicProperties = null;
		if(cmd.hasOption(DYNAMIC_PROPERTIES.getOpt())) {
			dynamicProperties = cmd.getOptionValues(DYNAMIC_PROPERTIES.getOpt());
		}
		String dynamicPropertiesEncoded = StringUtils.join(dynamicProperties, CliFrontend.YARN_DYNAMIC_PROPERTIES_SEPARATOR);

		flinkYarnClient.setDynamicPropertiesEncoded(dynamicPropertiesEncoded);

		// Utils.getFlinkConfiguration(confPath.toUri().getPath());

		return flinkYarnClient;
	}


	private static void printUsage() {
		System.out.println("Usage:");
		HelpFormatter formatter = new HelpFormatter();
		formatter.setWidth(200);
		formatter.setLeftPadding(5);
		formatter.setSyntaxPrefix("   Required");
		Options req = new Options();
		req.addOption(CONTAINER);
		formatter.printHelp(" ", req);

		formatter.setSyntaxPrefix("   Optional");
		Options opt = new Options();
		opt.addOption(VERBOSE);
		opt.addOption(JM_MEMORY);
		opt.addOption(TM_MEMORY);
		opt.addOption(QUERY);
		opt.addOption(QUEUE);
		opt.addOption(SLOTS);
		opt.addOption(DYNAMIC_PROPERTIES);
		formatter.printHelp(" ", opt);
	}

	public static AbstractFlinkYarnClient getFlinkYarnClient() {
		AbstractFlinkYarnClient yarnClient = null;
		try {
			Class<AbstractFlinkYarnClient> yarnClientClass = (Class<AbstractFlinkYarnClient>) Class.forName("org.apache.flink.yarn.FlinkYarnClient");
			yarnClient = InstantiationUtil.instantiate(yarnClientClass, AbstractFlinkYarnClient.class);
		} catch (ClassNotFoundException e) {
			System.err.println("Unable to locate the Flink YARN Client. Please ensure that you are using a Flink build with Hadoop2/YARN support. Message: "+e.getMessage());
			e.printStackTrace(System.err);
			return null; // make it obvious
		}
		return yarnClient;
	}

	private static void writeYarnProperties(Properties properties, File propertiesFile) {
		try {
			OutputStream out = new FileOutputStream(propertiesFile);
			properties.store(out, "Generated YARN properties file");
			out.close();
		} catch (IOException e) {
			throw new RuntimeException("Error writing the properties file", e);
		}
		propertiesFile.setReadable(true, false); // readable for all.
	}

	public static void runInteractiveCli(AbstractFlinkYarnCluster yarnCluster) {
		final String HELP = "Available commands:\n" +
				"help - show these commands\n" +
				"stop - stop the YARN session";
		int numTaskmanagers = 0;
		try {
			BufferedReader in = new BufferedReader(new InputStreamReader(System.in));
			while (true) {
				// ------------------ check if there are updates by the cluster -----------

				FlinkYarnClusterStatus status = yarnCluster.getClusterStatus();
				if(numTaskmanagers != status.getNumberOfTaskManagers()) {
					System.err.println("Number of connected TaskManagers changed to "+status.getNumberOfTaskManagers()+". "
							+ "Slots available: "+status.getNumberOfSlots());
					numTaskmanagers = status.getNumberOfTaskManagers();
				}

				List<String> messages = yarnCluster.getNewMessages();
				if(messages != null && messages.size() > 0) {
					System.err.println("New messages from the YARN cluster: ");
					for(String msg : messages) {
						System.err.println(msg);
					}
				}

				if(yarnCluster.hasFailed()) {
					System.err.println("The YARN cluster has failed");
				}

				// wait until CLIENT_POLLING_INTERVALL is over or the user entered something.
				long startTime = System.currentTimeMillis();
				while ((System.currentTimeMillis() - startTime) < CLIENT_POLLING_INTERVALL * 1000
						&& !in.ready()) {
					Thread.sleep(200);
				}
				//------------- handle interactive command by user. ----------------------

				if (in.ready()) {
					String command = in.readLine();
					if(command.equals("quit") || command.equals("stop")) {
						break; // leave loop, cli will stop cluster.
					} else if(command.equals("help"))  {
						System.err.println(HELP);
					} else {
						System.err.println("Unknown command '"+command+"'. Showing help: \n"+HELP);
					}
				}
			}
		} catch(Exception e) {
			LOG.warn("Exception while running the interactive command line interface", e);
			return;
		}
	}

	public static void main(String[] args) {
		System.exit(run(args));
	}

	public static int run(String[] args) {

		//
		//	Command Line Options
		//
		Options options = new Options();
		options.addOption(VERBOSE);
		options.addOption(FLINK_JAR);
		options.addOption(JM_MEMORY);
		options.addOption(TM_MEMORY);
		options.addOption(CONTAINER);
		options.addOption(QUEUE);
		options.addOption(QUERY);
		options.addOption(SHIP_PATH);
		options.addOption(SLOTS);
		options.addOption(DYNAMIC_PROPERTIES);

		CommandLineParser parser = new PosixParser();
		CommandLine cmd = null;
		try {
			cmd = parser.parse( options, args);
		} catch(Exception e) {
			System.out.println(e.getMessage());
			printUsage();
			return 1;
		}

		FlinkYarnSessionCli yarnSessionCli = new FlinkYarnSessionCli();

		AbstractFlinkYarnClient flinkYarnClient = yarnSessionCli.createFlinkYarnClient(cmd);

		if(flinkYarnClient == null) {
			System.err.println("Error while starting the YARN Client. Please check log output!");
			return 1;
		}

		// Query cluster for metrics
		if(cmd.hasOption(QUERY.getOpt())) {
			String description = null;
			try {
				description = flinkYarnClient.getClusterDescription();
			} catch (Exception e) {
				System.err.println("Error while querying the YARN cluster for available resources: "+e.getMessage());
				e.printStackTrace(System.err);
				return 1;
			}
			System.out.println(description);
			return 0;
		} else {
			AbstractFlinkYarnCluster yarnCluster = null;
			try {
				yarnCluster = flinkYarnClient.deploy(null);
			} catch (Exception e) {
				System.err.println("Error while deploying YARN cluster: "+e.getMessage());
				e.printStackTrace(System.err);
				return 1;
			}
			//------------------ Cluster deployed, handle connection details
			String jobManagerAddress = yarnCluster.getJobManagerAddress().toString();
			System.err.println("Flink JobManager is now running on " + jobManagerAddress);
			System.err.println("JobManager Web Interface: " + yarnCluster.getWebInterfaceURL());
			// file that we write into the conf/ dir containing the jobManager address and the dop.
			String confDirPath = CliFrontend.getConfigurationDirectoryFromEnv();
			File yarnPropertiesFile = new File(confDirPath + File.separator + CliFrontend.YARN_PROPERTIES_FILE);

			Properties yarnProps = new Properties();
			yarnProps.setProperty(CliFrontend.YARN_PROPERTIES_JOBMANAGER_KEY, jobManagerAddress);
			if(flinkYarnClient.getTaskManagerSlots() != -1) {
				yarnProps.setProperty(CliFrontend.YARN_PROPERTIES_DOP, Integer.toString(flinkYarnClient.getTaskManagerSlots() * flinkYarnClient.getTaskManagerCount()) );
			}
			// add dynamic properties
			if(flinkYarnClient.getDynamicPropertiesEncoded() != null) {
				yarnProps.setProperty(CliFrontend.YARN_PROPERTIES_DYNAMIC_PROPERTIES_STRING, flinkYarnClient.getDynamicPropertiesEncoded());
			}
			writeYarnProperties(yarnProps, yarnPropertiesFile);

			//------------------ Cluster running, let user control it ------------

			runInteractiveCli(yarnCluster);

			LOG.info("Command Line Interface requested session shutdown");
			yarnCluster.shutdown();

			try {
				yarnPropertiesFile.delete();
			} catch (Exception e) {
				LOG.warn("Exception while deleting the JobManager address file", e);
			}
		}
		return 0;
	}
}

