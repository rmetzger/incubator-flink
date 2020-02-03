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

echo $M2_HOME
echo $PATH
echo $MAVEN_OPTS

mvn -version
echo "Commit: $(git rev-parse HEAD)"


cat << EOF > /tmp/az_settings.xml
<settings>
  <mirrors>
    <mirror>
      <id>google-maven-central</id>
      <name>GCS Maven Central mirror</name>
      <url>https://maven-central.storage-download.googleapis.com/repos/central/data/</url>
      <mirrorOf>central</mirrorOf>
    </mirror>
  </mirrors>
</settings>
EOF


HERE="`dirname \"$0\"`"             # relative
HERE="`( cd \"$HERE\" && pwd )`"    # absolutized and normalized
if [ -z "$HERE" ] ; then
    # error; for some reason, the path is not accessible
    # to the script (e.g. permissions re-evaled after suid)
    exit 1  # fail
fi

source "${HERE}/travis/stage.sh"
source "${HERE}/travis/shade.sh"

print_system_info() {
    echo "CPU information"
    lscpu

    echo "Memory information"
    cat /proc/meminfo

    echo "Disk information"
    df -hH

    echo "Running build as"
    whoami
}

print_system_info


STAGE=$1
echo "Current stage: \"$STAGE\""

EXIT_CODE=0

#adding -Dmaven.wagon.http.pool=false (see https://developercommunity.visualstudio.com/content/problem/851041/microsoft-hosted-agents-run-into-maven-central-tim.html)
MVN="mvn clean install --settings /tmp/az_settings.xml $MAVEN_OPTS -nsu -Dflink.convergence.phase=install -Pcheck-convergence -Dflink.forkCount=2 -Dflink.forkCountTestPackage=2 -Dmaven.wagon.http.pool=false -Dmaven.javadoc.skip=true -B -DskipTests $PROFILE"

# Run actual compile&test steps
if [ $STAGE == "$STAGE_COMPILE" ]; then
    # run mvn clean install:
    $MVN
    EXIT_CODE=$?

    if [ $EXIT_CODE == 0 ]; then
        echo "\n\n==============================================================================\n"
        echo "Checking scala suffixes\n"
        echo "==============================================================================\n"

        ./tools/verify_scala_suffixes.sh "${PROFILE}"
        EXIT_CODE=$?
    else
        echo "\n==============================================================================\n"
        echo "Previous build failure detected, skipping scala-suffixes check.\n"
        echo "==============================================================================\n"
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

    if [ $EXIT_CODE == 0 ]; then
        echo "Creating cache build directory $CACHE_FLINK_DIR"
    
        cp -r . "$CACHE_FLINK_DIR"

        function minimizeCachedFiles() {
            # reduces the size of the cached directory to speed up
            # the packing&upload / download&unpacking process
            # by removing files not required for subsequent stages
    
            # jars are re-built in subsequent stages, so no need to cache them (cannot be avoided)
            find "$CACHE_FLINK_DIR" -maxdepth 8 -type f -name '*.jar' \
            ! -path "$CACHE_FLINK_DIR/flink-formats/flink-csv/target/flink-csv*.jar" \
            ! -path "$CACHE_FLINK_DIR/flink-formats/flink-json/target/flink-json*.jar" \
            ! -path "$CACHE_FLINK_DIR/flink-formats/flink-avro/target/flink-avro*.jar" \
            ! -path "$CACHE_FLINK_DIR/flink-runtime/target/flink-runtime*tests.jar" \
            ! -path "$CACHE_FLINK_DIR/flink-streaming-java/target/flink-streaming-java*tests.jar" \
            ! -path "$CACHE_FLINK_DIR/flink-dist/target/flink-*-bin/flink-*/lib/flink-dist*.jar" \
            ! -path "$CACHE_FLINK_DIR/flink-dist/target/flink-*-bin/flink-*/lib/flink-table_*.jar" \
            ! -path "$CACHE_FLINK_DIR/flink-dist/target/flink-*-bin/flink-*/lib/flink-table-blink*.jar" \
            ! -path "$CACHE_FLINK_DIR/flink-dist/target/flink-*-bin/flink-*/opt/flink-python*.jar" \
            ! -path "$CACHE_FLINK_DIR/flink-connectors/flink-connector-elasticsearch-base/target/flink-*.jar" \
            ! -path "$CACHE_FLINK_DIR/flink-connectors/flink-connector-kafka-base/target/flink-*.jar" \
            ! -path "$CACHE_FLINK_DIR/flink-table/flink-table-planner/target/flink-table-planner*tests.jar" | xargs rm -rf
    
            # .git directory
            # not deleting this can cause build stability issues
            # merging the cached version sometimes fails
            rm -rf "$CACHE_FLINK_DIR/.git"

            # AZ Pipelines has a problem with links.
            rm "$CACHE_FLINK_DIR/build-target"
        }
    
        echo "Minimizing cache"
        minimizeCachedFiles
    else
        echo "=============================================================================="
        echo "Previous build failure detected, skipping cache setup."
        echo "=============================================================================="
    fi
elif [ $STAGE != "$STAGE_CLEANUP" ]; then
    if ! [ -e $CACHE_FLINK_DIR ]; then
        echo "Cached flink dir $CACHE_FLINK_DIR does not exist. Exiting build."
        exit 1
    fi
    # merged compiled flink into local clone
    # this prevents the cache from being re-uploaded
    echo "Merging cache"
    cp -RT "$CACHE_FLINK_DIR" "."

    echo "Adjusting timestamps"
    # adjust timestamps to prevent recompilation
    find . -type f -name '*.java' | xargs touch
    find . -type f -name '*.scala' | xargs touch
    # wait a bit for better odds of different timestamps
    sleep 5
    find . -type f -name '*.class' | xargs touch
    find . -type f -name '*.timestamp' | xargs touch

    if [ $STAGE == $STAGE_PYTHON ]; then
        echo "=============================================================================="
        echo "Python stage found. Re-compiling (this is required on Azure for the python tests to pass)"
        echo "=============================================================================="
        # run mvn install (w/o "clean"):
        PY_MVN="${MVN// clean/}"
        PY_MVN="$PY_MVN -Drat.skip=true"
        ${PY_MVN}
        echo "Done compiling ... "
    fi

    echo "===== Set DOCKER_TEST_INFRA_DIR ===== "
    #
    # Some tests in the "run-pre-commit-tests.sh" collection launch Docker containers.
    # Since the regular build is executed in Docker (on Azure), we'll be launching those 
    # containers outside of the current container (on the host, alongside the build&test container).
    # Some of these containers mount a path. Currently, these scripts mount relative to the build container,
    # thus this path is not available on the host (where the test container is launched).
    # 
    # Here, we figure out the path on the host machine, and set it.
    #

    #STUPID DEBUGGING
    env
    docker ps
    
    DOCKER_THIS_ID=$AGENT_CONTAINERID

    #STUPID DEBUGGING
    docker inspect $DOCKER_THIS_ID

    # get volume mount source
    DOCKER_VOLUME_MOUNT_SOURCE=`docker inspect  -f '{{json .Mounts }}' $DOCKER_THIS_ID | jq -r '.[] | .Source | match("(.*_work/[0-9]+)") | .string'`
    export DOCKER_TEST_INFRA_DIR=${DOCKER_VOLUME_MOUNT_SOURCE}$(basename $PIPELINE_WORKSPACE)/s/flink-end-to-end-tests/test-scripts/
    echo "DOCKER_TEST_INFRA_DIR determined as '$DOCKER_TEST_INFRA_DIR'"

    #SMART DEBUGGING
    docker run -v $DOCKER_TEST_INFRA_DIR:/test rmetzger/flink-ci:5-ubuntu-amd64 ls -lisah /test

    TEST="$STAGE" "./tools/travis_watchdog.sh" 300
    EXIT_CODE=$?
elif [ $STAGE == "$STAGE_CLEANUP" ]; then
    echo "Cleaning up $CACHE_BUILD_DIR"
    rm -rf "$CACHE_BUILD_DIR"
else
    echo "Invalid Stage specified: $STAGE"
    exit 1
fi

# Exit code for Azure build success/failure
exit $EXIT_CODE
