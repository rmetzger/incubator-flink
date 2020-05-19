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
# This file contains a watchdog tool to run monitor and potentially kill tasks
# not producing any output for n seconds.
#

# Number of seconds w/o output before printing a stack trace and killing the watched process
MAX_NO_OUTPUT=${MAX_NO_OUTPUT:-900}

# Number of seconds to sleep before checking the output again
SLEEP_TIME=${SLEEP_TIME:-20}

CMD_OUT=${CMD_OUT:-"/tmp/watchdog.out"}
CMD_PID=${CMD_PID:-"/tmp/watchdog.pid"}
CMD_EXIT=${CMD_EXIT:-"/tmp/watchdog.exit"}


# ============================================= #
# Utility functions								#
# ============================================= #

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

# watchdog process

watchdog () {
	touch $CMD_OUT

	while true; do
		sleep $SLEEP_TIME

		time_diff=$((`the_time` - `mod_time`))

		if [ $time_diff -ge $MAX_NO_OUTPUT ]; then
			echo "=============================================================================="
			echo "Prodcess produced no output for ${MAX_NO_OUTPUT} seconds."
			echo "=============================================================================="

			# run timeout callback
			$WATCHDOG_CALLBACK_ON_TIMEOUT

			# Kill $CMD and all descendants
			pkill -P $(<$CMD_PID)

			exit 1
		fi
	done
}

assume_available () {
	VAR=$1
	if [ -z "$VAR" ] ; then
		echo "ERROR: Environment variable '$VAR' is not set but expected by watchdog.sh"
		exit 1
	fi
}

# ============================================= #
# main function									#
# ============================================= #


# entrypoint
run_with_watchdog() {
	local cmd="$1"

	# check preconditions
	assume_available CMD_OUT # used for writing the process output (to check for activity)
	assume_available CMD_PID # location of file to write process id to
	assume_available CMD_EXIT # location of file to writ exit code to
	assume_available WATCHDOG_CALLBACK_ON_TIMEOUT # bash function to call on timeout

	watchdog &
	WD_PID=$!
	echo "STARTED watchdog (${WD_PID})."

	echo "RUNNING '${cmd}'."

	# Run $CMD and pipe output to $CMD_OUT for the watchdog. The PID is written to $CMD_PID to
	# allow the watchdog to kill $CMD if it is not producing any output anymore. $CMD_EXIT contains
	# the exit code. This is important for CI build life-cycle (success/failure).
	( $cmd & PID=$! ; echo $PID >&3 ; wait $PID ; echo $? >&4 ) 3>$CMD_PID 4>$CMD_EXIT | tee $CMD_OUT

	EXIT_CODE=$(<$CMD_EXIT)

	echo "Process exited with EXIT CODE: ${EXIT_CODE}."

	# Make sure to kill the watchdog in any case after $CMD has completed
	echo "Trying to KILL watchdog (${WD_PID})."
	( kill $WD_PID 2>&1 ) > /dev/null

	rm $CMD_PID
	rm $CMD_EXIT

	return $EXIT_CODE
}


