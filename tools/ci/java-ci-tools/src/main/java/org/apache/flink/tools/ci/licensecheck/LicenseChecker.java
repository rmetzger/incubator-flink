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

package org.apache.flink.tools.ci.licensecheck;

//CHECKSTYLE:OFF
import com.google.common.base.Preconditions;
import com.google.common.collect.ArrayListMultimap;
import com.google.common.collect.Multimap;
//CHECKSTYLE:ON
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.io.BufferedReader;
import java.io.File;
import java.io.FileReader;
import java.io.IOException;
import java.io.InputStream;
import java.io.StringReader;
import java.nio.charset.Charset;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Scanner;
import java.util.Set;
import java.util.regex.Matcher;
import java.util.regex.Pattern;
import java.util.stream.Collectors;

/**
 * Utility class checking for proper NOTICE files based on the maven build output.
 */
public class LicenseChecker {
	// ---------------------------------------- Launcher ---------------------------------------- //

	private static final Logger LOG = LoggerFactory.getLogger(LicenseChecker.class);

	public static void main(String[] args) throws IOException {
		if (args.length < 2) {
			System.out.println("Usage: LicenseChecker <pathMavenBuildOutput> <pathFlinkRoot>");
			System.exit(1);
		}
		LOG.warn("THIS UTILITY IS ONLY CHECKING FOR COMMON LICENSING MISTAKES. A MANUAL CHECK OF THE NOTICE FILES, DEPLOYED ARTIFACTS, ETC. IS STILL NEEDED!");

		LicenseChecker checker = new LicenseChecker();
		int severeIssueCount = checker.run(new File(args[0]), new File(args[1]));

		if (severeIssueCount > 0) {
			LOG.warn("Found a total of {} license issues", severeIssueCount);

			System.exit(1);
		}
	}

	// ---------------------------------------- License Checker ---------------------------------------- //

	private static final List<String> MODULES_SKIPPING_DEPLOYMENT = loadFromResources("modules-skipping-deployment.modulelist");

	private static final List<String> MODULES_DEFINING_EXCESS_DEPENDENCIES = loadFromResources("modules-defining-excess-dependencies.modulelist");

	private static final Pattern INCLUDE_MODULE_PATTERN = Pattern.compile(".*Including ([^:]+):([^:]+):jar:([^ ]+) in the shaded jar");
	private static final Pattern NEXT_MODULE_PATTERN = Pattern.compile(".*:shade \\(shade-flink\\) @ ([^ _]+)(_[0-9.]+)? --.*");
	private static final Pattern NOTICE_DEPENDENCY_PATTERN = Pattern.compile("- ([^:]+):([^:]+):([^\n]+)$");


	private int run(File buildResult, File root) throws IOException {
		int severeIssueCount = 0;
		// parse included dependencies from build output
		Multimap<String, Dependency> modulesWithShadedDependencies = parseModulesFromBuildResult(buildResult);
		LOG.info("Extracted " + modulesWithShadedDependencies.asMap().keySet().size() + " modules with a total of " + modulesWithShadedDependencies.values().size() + " dependencies");

		// find modules producing a shaded-jar
		List<File> noticeFiles = findNoticeFiles(root);
		LOG.info("Found {} NOTICE files to check", noticeFiles.size());

		// check that all required NOTICE files exists
		severeIssueCount += ensureRequiredNoticeFiles(modulesWithShadedDependencies, noticeFiles);

		// check each NOTICE file
		for (File noticeFile: noticeFiles) {
			severeIssueCount += checkNoticeFile(modulesWithShadedDependencies, noticeFile);
		}

		// find modules included in flink-dist

		return severeIssueCount;
	}

	private int ensureRequiredNoticeFiles(Multimap<String, Dependency> modulesWithShadedDependencies, List<File> noticeFiles) {
		int severeIssueCount = 0;
		Set<String> shadingModules = new HashSet<>(modulesWithShadedDependencies.keys());
		shadingModules.removeAll(noticeFiles.stream().map(LicenseChecker::getModuleFromNoticeFile).collect(Collectors.toList()));
		for (String moduleWithoutNotice : shadingModules) {
			if (!MODULES_SKIPPING_DEPLOYMENT.contains(moduleWithoutNotice)) {
				LOG.warn("Module {} is missing a NOTICE file. It has shaded dependencies: {}", moduleWithoutNotice, modulesWithShadedDependencies.get(moduleWithoutNotice));
				severeIssueCount++;
			}
		}
		return severeIssueCount;
	}

	private static String getModuleFromNoticeFile(File noticeFile) {
		File moduleFile = noticeFile.getParentFile() // META-INF
			.getParentFile() // resources
			.getParentFile() // main
			.getParentFile() // src
			.getParentFile(); // <-- module name
		return moduleFile.getName();
	}

	private int checkNoticeFile(Multimap<String, Dependency> modulesWithShadedDependencies, File noticeFile) throws IOException {
		int severeIssueCount = 0;
		String moduleName = getModuleFromNoticeFile(noticeFile);

		// 1st line contains module name
		String noticeContents = readFile(noticeFile.toPath());
		if (!noticeContents.startsWith(moduleName)) {
			String firstLine = noticeContents.substring(0, noticeContents.indexOf('\n'));
			LOG.warn("Expected first file of notice file to start with module name. moduleName={}, firstLine={}", moduleName, firstLine);
		}

		// collect all declared dependencies from NOTICE file
		Set<Dependency> declaredDependencies = new HashSet<>();
		try (BufferedReader br = new BufferedReader(new StringReader(noticeContents))) {
			String line;
			while ((line = br.readLine()) != null) {
				Matcher noticeDependencyMatcher = NOTICE_DEPENDENCY_PATTERN.matcher(line);
				if (noticeDependencyMatcher.find()) {
					String groupId = noticeDependencyMatcher.group(1);
					String artifactId = noticeDependencyMatcher.group(2);
					String version = noticeDependencyMatcher.group(3);
					Dependency toAdd = Dependency.create(groupId, artifactId, version);
					if (!declaredDependencies.add(toAdd)) {
						LOG.warn("Dependency {} has been declared twice in module {}", toAdd, moduleName);
					}
				}
			}
		}
		// print all dependencies missing from NOTICE file
		Set<Dependency> expectedDependencies = new HashSet<>(modulesWithShadedDependencies.get(moduleName));
		expectedDependencies.removeAll(declaredDependencies);
		for (Dependency missingDependency : expectedDependencies) {
			LOG.error("Could not find dependency {} in NOTICE file {}", missingDependency, noticeFile);
			severeIssueCount++;
		}

		if (!MODULES_DEFINING_EXCESS_DEPENDENCIES.contains(moduleName)) {
			// print all dependencies defined in NOTICE file, which were not expected
			Set<Dependency> excessDependencies = new HashSet<>(declaredDependencies);
			excessDependencies.removeAll(modulesWithShadedDependencies.get(moduleName));
			for (Dependency excessDependency : excessDependencies) {
				LOG.warn("Dependency {} is mentioned in NOTICE file {}, but is not expected there", excessDependency, noticeFile);
			}
		}

		return severeIssueCount;
	}

	private static String readFile(Path path) throws IOException {
		byte[] encoded = Files.readAllBytes(path);
		return new String(encoded, Charset.defaultCharset());
	}

	private List<File> findNoticeFiles(File root) throws IOException {
		return Files.walk(root.toPath())
			.filter(file -> {
				int nameCount = file.getNameCount();
				return file.getName(nameCount - 1).toString().equals("NOTICE")
					&& file.getName(nameCount - 2).toString().equals("META-INF")
					&& file.getName(nameCount - 3).toString().equals("resources");
			})
			.map(Path::toFile)
			.collect(Collectors.toList());
	}

	private Multimap<String, Dependency> parseModulesFromBuildResult(File buildResult) throws IOException {
		Multimap<String, Dependency> result = ArrayListMultimap.create();
		try (BufferedReader br = new BufferedReader(new FileReader(buildResult))) {
			String line;
			String currentModule = null;
			while ((line = br.readLine()) != null) {
				Matcher nextModuleMatcher = NEXT_MODULE_PATTERN.matcher(line);
				if (nextModuleMatcher.find()) {
					currentModule = nextModuleMatcher.group(1);
				}

				if (currentModule != null) {
					Matcher includeMatcher = INCLUDE_MODULE_PATTERN.matcher(line);
					if (includeMatcher.find()) {
						String groupId = includeMatcher.group(1);
						String artifactId = includeMatcher.group(2);
						String version = includeMatcher.group(3);
						if (!"org.apache.flink".equals(groupId)) {
							result.put(currentModule, Dependency.create(groupId, artifactId, version));
						}
					}
				}
				if (line.contains("eplacing original artifact with shaded artifact")) {
					currentModule = null;
				}
			}
		}
		return result;
	}

	private static List<String> loadFromResources(String fileName) {
		List<String> res = new ArrayList<>();
		try (InputStream in = LicenseChecker.class.getResourceAsStream("/" + fileName)) {
			try (Scanner scanner = new Scanner(in)) {
				while (scanner.hasNext()) {
					res.add(scanner.nextLine());
				}
			}
		} catch (IOException e) {
			LOG.warn("Error while loading resource", e);
		}

		return res;
	}

	private static final class Dependency {

		private final String groupId;
		private final String artifactId;
		private final String version;

		private Dependency(String groupId, String artifactId, String version) {
			this.groupId = Preconditions.checkNotNull(groupId);
			this.artifactId = Preconditions.checkNotNull(artifactId);
			this.version = Preconditions.checkNotNull(version);
		}

		public static Dependency create(String groupId, String artifactId, String version) {
			return new Dependency(groupId, artifactId, version);
		}

		@Override
		public String toString() {
			return groupId + ":" + artifactId + ":" + version;
		}

		@Override
		public boolean equals(Object o) {
			if (this == o) {
				return true;
			}
			if (o == null || getClass() != o.getClass()) {
				return false;
			}

			Dependency that = (Dependency) o;

			if (!groupId.equals(that.groupId)) {
				return false;
			}
			if (!artifactId.equals(that.artifactId)) {
				return false;
			}
			return version.equals(that.version);
		}

		@Override
		public int hashCode() {
			int result = groupId.hashCode();
			result = 31 * result + artifactId.hashCode();
			result = 31 * result + version.hashCode();
			return result;
		}
	}
}
