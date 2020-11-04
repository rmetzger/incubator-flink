#!/usr/bin/env bash
################################################################################
#  Licensed to the Apache Software Foundation (ASF) under one
#  or more contributor license agreements.  See the NOTICE file
#  distributed with this work for additional information
#  regarding copyright ownership.  The ASF licenses this file
#  to you under the Apache License, Version 2.0 (the
#  "License"); you may not use this file except in compliance
#  with the License.  You may obtain a copy of the License at
#
#      http://www.apache.org/licenses/LICENSE-2.0
#
#  Unless required by applicable law or agreed to in writing, software
#  distributed under the License is distributed on an "AS IS" BASIS,
#  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
#  See the License for the specific language governing permissions and
# limitations under the License.
################################################################################

END_TO_END_DIR="`dirname \"$0\"`" # relative
END_TO_END_DIR="`( cd \"$END_TO_END_DIR\" && pwd -P)`" # absolutized and normalized
if [ -z "$END_TO_END_DIR" ] ; then
    # error; for some reason, the path is not accessible
    # to the script (e.g. permissions re-evaled after suid)
    exit 1  # fail
fi

export END_TO_END_DIR

if [ -z "$FLINK_DIR" ] ; then
    echo "You have to export the Flink distribution directory as FLINK_DIR"
    exit 1
fi

source "${END_TO_END_DIR}/../tools/ci/maven-utils.sh"
source "${END_TO_END_DIR}/test-scripts/test-runner-common.sh"

# On Azure CI, set artifacts dir
if [ ! -z "$TF_BUILD" ] ; then
	export ARTIFACTS_DIR="${END_TO_END_DIR}/artifacts"
	mkdir -p $ARTIFACTS_DIR || { echo "FAILURE: cannot create log directory '${ARTIFACTS_DIR}'." ; exit 1; }

	function run_on_exit {
		collect_coredumps $(pwd) $ARTIFACTS_DIR
		compress_logs
	}

	# compress and register logs for publication on exit
	function compress_logs {
		echo "DEBUG ALL FILES"
		find .
		echo "DONE DEBUG"
		echo "COMPRESSING build artifacts."
		COMPRESSED_ARCHIVE=${BUILD_BUILDNUMBER}.tgz
		mkdir compressed-archive-dir
		tar -zcvf compressed-archive-dir/${COMPRESSED_ARCHIVE} -C $ARTIFACTS_DIR .
		echo "##vso[task.setvariable variable=ARTIFACT_DIR]$(pwd)/compressed-archive-dir"
	}
	on_exit run_on_exit
fi

FLINK_DIR="`( cd \"$FLINK_DIR\" && pwd -P)`" # absolutized and normalized

echo "flink-end-to-end-test directory: $END_TO_END_DIR"
echo "Flink distribution directory: $FLINK_DIR"

echo "Java and Maven version"
java -version
run_mvn -version

echo "Free disk space"
df -h

echo "Running with profile '$PROFILE'"



printf "\n\n==============================================================================\n"
printf "Running Java end-to-end tests\n"
printf "==============================================================================\n"


LOG4J_PROPERTIES=${END_TO_END_DIR}/../tools/ci/log4j.properties

MVN_LOGGING_OPTIONS="-Dlog.dir=${ARTIFACTS_DIR} -DlogBackupDir=${ARTIFACTS_DIR} -Dlog4j.configurationFile=file://$LOG4J_PROPERTIES"
MVN_COMMON_OPTIONS="-Dflink.forkCount=2 -Dflink.forkCountTestPackage=2 -Dfast -Pskip-webui-build"
e2e_modules=$(find flink-end-to-end-tests -mindepth 2 -maxdepth 5 -name 'pom.xml' -printf '%h\n' | sort -u | tr '\n' ',')
e2e_modules="${e2e_modules},$(find flink-walkthroughs -mindepth 2 -maxdepth 2 -name 'pom.xml' -printf '%h\n' | sort -u | tr '\n' ',')"

PROFILE="$PROFILE -Pe2e-travis1 -Pe2e-travis2 -Pe2e-travis3 -Pe2e-travis4 -Pe2e-travis5 -Pe2e-travis6"
run_mvn ${MVN_COMMON_OPTIONS} ${MVN_LOGGING_OPTIONS} ${PROFILE} verify -pl ${e2e_modules} -DdistDir=$(readlink -e build-target) -Dcache-dir=$E2E_CACHE_FOLDER -Dcache-ttl=P1M -Dcache-download-attempt-timeout=4min -Dcache-download-global-timeout=10min
EXIT_CODE=$?

for i in $(seq 1 75); do
	echo "Run i = $i"
	if [[ "$EXIT_CODE" == "0" ]]; then
		run_mvn ${MVN_COMMON_OPTIONS} ${MVN_LOGGING_OPTIONS} ${PROFILE} verify -pl ${e2e_modules} -DdistDir=$(readlink -e build-target) -Dcache-dir=$E2E_CACHE_FOLDER -Dcache-ttl=P1M -Dcache-download-attempt-timeout=4min -Dcache-download-global-timeout=10min
		EXIT_CODE=$?
	else
		exit $EXIT_CODE
	fi
done

exit $EXIT_CODE
