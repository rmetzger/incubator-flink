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


#
# This script executes Maven, while making sure it does not stall during execution.
# If Maven stalls, some debugging information will be logged, before the process
# gets killed.
#

HERE="`dirname \"$0\"`"				# relative
HERE="`( cd \"$HERE\" && pwd )`" 	# absolutized and normalized
if [ -z "$HERE" ] ; then
	# error; for some reason, the path is not accessible
	# to the script (e.g. permissions re-evaled after suid)
	exit 1  # fail
fi

# =============================================================================
# CONFIG
# =============================================================================

# Number of seconds w/o output before printing a stack trace and killing $MVN
MAX_NO_OUTPUT=${MAX_NO_OUTPUT:-300}

# Number of seconds to sleep before checking the output again
SLEEP_TIME=20

TMP_DIR=${TMP_DIR:-/tmp}

MVN_PID="${TMP_DIR}/watchdog.mvn.pid"
MVN_EXIT="${TMP_DIR}/watchdog.mvn.exit"
MVN_OUT="${ARTIFACTS_DIR}/mvn.out"

TRACE_OUT="${ARTIFACTS_DIR}/jps-traces.out"

CMD=$*




# =============================================================================
# FUNCTIONS
# =============================================================================


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



mod_time () {
	if [[ `uname` == 'Darwin' ]]; then
		eval $(stat -s $CMD_OUT)
		echo $st_mtime
	else
		echo `stat -c "%Y" $CMD_OUT`
	fi
}

the_time() {
	echo `date +%s`
}

# =============================================================================
# WATCHDOG
# =============================================================================

watchdog () {
	touch $CMD_OUT

	while true; do
		sleep $SLEEP_TIME

		time_diff=$((`the_time` - `mod_time`))

		if [ $time_diff -ge $MAX_NO_OUTPUT ]; then
			echo "=============================================================================="
			echo "Maven produced no output for ${MAX_NO_OUTPUT} seconds."
			echo "=============================================================================="

			print_stacktraces | tee $TRACE_OUT

			kill $(<$CMD_PID)

			exit 1
		fi
	done
}

run_with_watchdog() {
	local cmd="$1"

	watchdog &
	WD_PID=$!
	echo "STARTED watchdog (${WD_PID})."

	# Make sure to be in project root
	cd "$HERE/../"

	echo "RUNNING '${cmd}'."

	# Run $CMD and pipe output to $CMD_OUT for the watchdog. The PID is written to $CMD_PID to
	# allow the watchdog to kill $CMD if it is not producing any output anymore. $CMD_EXIT contains
	# the exit code. This is important for Travis' build life-cycle (success/failure).
	( $cmd & PID=$! ; echo $PID >&3 ; wait $PID ; echo $? >&4 ) 3>$CMD_PID 4>$CMD_EXIT | tee $CMD_OUT

	EXIT_CODE=$(<$CMD_EXIT)

	echo "${CMD_TYPE} exited with EXIT CODE: ${EXIT_CODE}."

	# Make sure to kill the watchdog in any case after $CMD has completed
	echo "Trying to KILL watchdog (${WD_PID})."
	( kill $WD_PID 2>&1 ) > /dev/null

	rm $CMD_PID
	rm $CMD_EXIT
}

# =============================================================================
# MAIN
# =============================================================================

run_with_watchdog "$CMD"


# Exit code for CI build success/failure
exit $EXIT_CODE
