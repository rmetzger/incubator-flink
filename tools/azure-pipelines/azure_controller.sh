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


HERE="`dirname \"$0\"`"				# relative
HERE="`( cd \"$HERE\" && pwd )`" 	# absolutized and normalized
if [ -z "$HERE" ] ; then
	# error; for some reason, the path is not accessible
	# to the script (e.g. permissions re-evaled after suid)
	exit 1  # fail
fi

source "${HERE}/../travis/shade.sh"





STAGE=$1
echo "Current stage: \"$STAGE\""

EXIT_CODE=0

# Run actual compile&test steps
if [ $STAGE == "$STAGE_COMPILE" ]; then
	MVN="mvn clean install $MAVEN_OPTS -nsu -Dflink.convergence.phase=install -Pcheck-convergence -Dflink.forkCount=2 -Dflink.forkCountTestPackage=2 -Dmaven.javadoc.skip=true -B -DskipTests $PROFILE"
    $MVN
	EXIT_CODE=$?

    if [ $EXIT_CODE == 0 ]; then
        printf "\n\n==============================================================================\n"
        printf "Checking scala suffixes\n"
        printf "==============================================================================\n"

        ./tools/verify_scala_suffixes.sh "${PROFILE}"
        EXIT_CODE=$?
    else
        printf "\n==============================================================================\n"
        printf "Previous build failure detected, skipping scala-suffixes check.\n"
        printf "==============================================================================\n"
    fi
    
    if [ $EXIT_CODE == 0 ]; then
        check_shaded_artifacts
        EXIT_CODE=$(($EXIT_CODE+$?))
        check_shaded_artifacts_s3_fs hadoop
        EXIT_CODE=$(($EXIT_CODE+$?))
        check_shaded_artifacts_s3_fs presto
        EXIT_CODE=$(($EXIT_CODE+$?))
        check_shaded_artifacts_connector_elasticsearch 2
        EXIT_CODE=$(($EXIT_CODE+$?))
        check_shaded_artifacts_connector_elasticsearch 5
        EXIT_CODE=$(($EXIT_CODE+$?))
        check_shaded_artifacts_connector_elasticsearch 6
        EXIT_CODE=$(($EXIT_CODE+$?))
    else
        echo "=============================================================================="
        echo "Previous build failure detected, skipping shaded dependency check."
        echo "=============================================================================="
    fi

elif [ $STAGE != "$STAGE_CLEANUP" ]; then
	TEST="$STAGE" "./tools/travis_watchdog.sh" 300
	EXIT_CODE=$?
else
    echo "Invalid Stage specified: $STAGE"
    exit 1
fi

# Exit code for Azure build success/failure
exit $EXIT_CODE
