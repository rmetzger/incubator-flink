#!/usr/bin/env bash
################################################################################
# Licensed to the Apache Software Foundation (ASF) under one
# or more contributor license agreements.  See the NOTICE file
# distributed with this work for additional information
# regarding copyright ownership.  The ASF licenses this file
# to you under the Apache License, Version 2.0 (the
# "License"); you may not use this file except in compliance
# with the License.  You may obtain a copy of the License at
#
#     http://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an "AS IS" BASIS,
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
# See the License for the specific language governing permissions and
# limitations under the License.
################################################################################

if [[ $S3_SOURCED ]]; then
  echo "Only source common_s3.sh or common_s3_minio.sh in the same test, previously sourced $S3_SOURCED" && exit 1
fi
export S3_SOURCED="common_s3_minio.sh"

# export credentials into environment variables for AWS client
export AWS_REGION=us-east-1
export AWS_ACCESS_KEY_ID=access_key
export AWS_SECRET_ACCESS_KEY=secret_key

IT_CASE_S3_BUCKET=test-data

S3_TEST_DATA_WORDS_URI="s3://$IT_CASE_S3_BUCKET/words"

# allow injecting a custom data dir location.
DATA_DIR=$TEST_INFRA_DIR
if [ ! -z "$DOCKER_TEST_INFRA_DIR" ] ; then
  DATA_DIR=$DOCKER_TEST_INFRA_DIR
fi

_DOCKER_NETWORK=""
_MINIO_HOST="localhost"
if [ ! -z "$DOCKER_TEST_NETWORK" ] ; then
  _DOCKER_NETWORK="--network $DOCKER_TEST_NETWORK"
  _MINIO_HOST="minio"
fi

###################################
# Starts a docker container for s3 minio.
#
# Globals:
#   TEST_INFRA_DIR
#   AWS_ACCESS_KEY_ID
#   AWS_SECRET_ACCESS_KEY
# Exports:
#   MINIO_CONTAINER_ID
#   S3_ENDPOINT
###################################

env

function s3_start {
  echo "Spawning minio for s3 tests with DATA_DIR=$DATA_DIR"
  export MINIO_CONTAINER_ID=$(docker run -d \
    -P ${_DOCKER_NETWORK} --name minio -p 9000:9000 \
    --mount type=bind,source="$DATA_DIR",target=/data \
    -e "MINIO_ACCESS_KEY=$AWS_ACCESS_KEY_ID" -e "MINIO_SECRET_KEY=$AWS_SECRET_ACCESS_KEY" -e "MINIO_DOMAIN=${_MINIO_HOST}" \
    minio/minio \
    server \
    /data)
  while [[ "$(docker inspect -f {{.State.Running}} "$MINIO_CONTAINER_ID")" -ne "true" ]]; do
    sleep 0.1
  done
  docker inspect $MINIO_CONTAINER_ID

  _MINIO_HOST=`docker inspect $MINIO_CONTAINER_ID | jq -r ".[].NetworkSettings.Networks.$DOCKER_TEST_NETWORK.IPAddress"`
  #export S3_ENDPOINT="http://$(docker port "$MINIO_CONTAINER_ID" 9000 | sed s'/0\.0\.0\.0/minio/')"
  export S3_ENDPOINT="http://${_MINIO_HOST}:9000"
  wget $S3_ENDPOINT
  sleep 5
  wget $S3_ENDPOINT
  sleep 5
  wget $S3_ENDPOINT
  sleep 30 
  docker inspect $MINIO_CONTAINER_ID


  echo "Started minio @ $S3_ENDPOINT"
  on_exit s3_stop
}

###################################
# Stops the docker container of minio.
#
# Globals:
#   MINIO_CONTAINER_ID
###################################
function s3_stop {
  echo "Stopping minio ..."
  docker kill "$MINIO_CONTAINER_ID"
  docker rm "$MINIO_CONTAINER_ID"
  # remove .minio.sys folder
  docker run --mount type=bind,source="$DATA_DIR",target=/data alpine rm -rf /data/.minio.sys
  export S3_ENDPOINT=
  export MINIO_CONTAINER_ID=
}

# always start it while sourcing, so that MINIO_CONTAINER_ID is available from parent script
if [[ $MINIO_CONTAINER_ID ]]; then
  s3_stop
fi
s3_start

###################################
# Setup Flink s3 access.
#
# Globals:
#   FLINK_DIR
#   IT_CASE_S3_ACCESS_KEY
#   IT_CASE_S3_SECRET_KEY
# Arguments:
#   $1 - s3 filesystem type (hadoop/presto)
# Returns:
#   None
###################################
function s3_setup {
  add_optional_plugin "s3-fs-$1"

  set_config_key "s3.access-key" "$AWS_ACCESS_KEY_ID"
  set_config_key "s3.secret-key" "$AWS_SECRET_ACCESS_KEY"
  # change endpoint to minio's location
  set_config_key "s3.endpoint" "$S3_ENDPOINT"
  # If the test is using virtual host style (default), then it tries to reach minio on <bucket>.localhost:<port>,
  # which docker does not properly forward.
  set_config_key "s3.path.style.access" "true"
  set_config_key "s3.path-style-access" "true"
  set_config_key "s3.connection.timeout" "5000"
  set_config_key "akka.ask.timeout" "300 s"
  set_config_key "web.timeout" "300000"
}

function s3_setup_with_provider {
  add_optional_plugin "s3-fs-$1"
  # reads (AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY)
  set_config_key "$2" "com.amazonaws.auth.EnvironmentVariableCredentialsProvider"
  # change endpoint to minio's location
  set_config_key "s3.endpoint" "$S3_ENDPOINT"
  # If the test is using virtual host style (default), then it tries to reach minio on <bucket>.localhost:<port>,
  # which docker does not properly forward.
  set_config_key "s3.path.style.access" "true"
  set_config_key "s3.path-style-access" "true"
}

source "$(dirname "$0")"/common_s3_operations.sh