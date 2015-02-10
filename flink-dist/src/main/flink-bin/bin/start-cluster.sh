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


bin=`dirname "$0"`
bin=`cd "$bin"; pwd`

. "$bin"/config.sh

HOSTLIST=$FLINK_SLAVES

if [ "$HOSTLIST" = "" ]; then
    HOSTLIST="${FLINK_CONF_DIR}/slaves"
fi

if [ ! -f "$HOSTLIST" ]; then
    echo $HOSTLIST is not a valid slave list
    exit 1
fi

IS_SECURE_INTERNAL=`"$FLINK_BIN_DIR"/flink internal issecure`
IS_SECURE="0"
if [[ $IS_SECURE_INTERNAL == *"issecure=true"* ]]; then
    IS_SECURE="1"
    echo "Secure setup detected. Distributing tokens in cluster"
    # write tokens to conf dir.
    "$FLINK_BIN_DIR"/flink internal gettokens
fi


# cluster mode, bring up job manager locally and a task manager on every slave host
"$FLINK_BIN_DIR"/jobmanager.sh start cluster

GOON=true
while $GOON
do
    read line || GOON=false
    if [ -n "$line" ]; then
        HOST=$( extractHostName $line)
        if [ "$IS_SECURE" == "1" ]; then
            scp -F $FLINK_SSH_OPTS "$FLINK_CONF_DIR/.securityTokens" $HOST":$FLINK_CONF_DIR/.securityTokens"
        fi
        ssh -n $FLINK_SSH_OPTS $HOST -- "nohup /bin/bash $FLINK_BIN_DIR/taskmanager.sh start &"
    fi
done < "$HOSTLIST"


if [ "$IS_SECURE" == "1" ]; then
    rm "$FLINK_CONF_DIR/.securityTokens"
fi
