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

upload_artifacts_s3() {
	echo "PRODUCED build artifacts."

	ls $ARTIFACTS_DIR

	echo "COMPRESSING build artifacts."

	cd $ARTIFACTS_DIR
	dmesg > container.log
	tar -zcvf $ARTIFACTS_FILE *

	# Upload to secured S3
	if [ -n "$UPLOAD_BUCKET" ] && [ -n "$UPLOAD_ACCESS_KEY" ] && [ -n "$UPLOAD_SECRET_KEY" ]; then

		# Install artifacts tool
		curl -sL https://raw.githubusercontent.com/travis-ci/artifacts/master/install | bash

		PATH=$HOME/bin/artifacts:$HOME/bin:$PATH

		echo "UPLOADING build artifacts."

		# Upload everything in $ARTIFACTS_DIR. Use relative path, otherwise the upload tool
		# re-creates the whole directory structure from root.
		artifacts upload --bucket $UPLOAD_BUCKET --key $UPLOAD_ACCESS_KEY --secret $UPLOAD_SECRET_KEY --target-paths $UPLOAD_TARGET_PATH $ARTIFACTS_FILE
	fi

	# On Azure, publish ARTIFACTS_FILE as a build artifact
	if [ ! -z "$TF_BUILD" ] ; then
		TIMESTAMP=`date +%s` # append timestamp to name to allow multiple uploads for the same module
		ARTIFACT_DIR="$(pwd)/artifact-dir"
		mkdir $ARTIFACT_DIR
		cp $ARTIFACTS_FILE $ARTIFACT_DIR/
		
		echo "##vso[task.setvariable variable=ARTIFACT_DIR]$ARTIFACT_DIR"
		echo "##vso[task.setvariable variable=ARTIFACT_NAME]$(echo $MODULE | tr -dc '[:alnum:]\n\r')-$TIMESTAMP"
	fi
}


# locate YARN logs and put them into artifacts directory
put_yarn_logs_to_artifacts() {
	# Make sure to be in project root
	cd $HERE/../
	for file in `find ./flink-yarn-tests/target -type f -name '*.log'`; do
		TARGET_FILE=`echo "$file" | grep -Eo "container_[0-9_]+/(.*).log"`
		TARGET_DIR=`dirname	 "$TARGET_FILE"`
		mkdir -p "$ARTIFACTS_DIR/yarn-tests/$TARGET_DIR"
		cp $file "$ARTIFACTS_DIR/yarn-tests/$TARGET_FILE"
	done
}


print_stacktraces () {
	echo "=============================================================================="
	echo "The following Java processes are running (JPS)"
	echo "=============================================================================="

	jps

	local pids=( $(jps | awk '{print $1}') )

	for pid in "${pids[@]}"; do
		echo "=============================================================================="
		echo "Printing stack trace of Java process ${pid}"
		echo "=============================================================================="

		jstack $pid
	done
}

