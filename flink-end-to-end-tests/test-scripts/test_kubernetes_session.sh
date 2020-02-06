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

source "$(dirname "$0")"/common_kubernetes.sh

CLUSTER_ROLE_BINDING="flink-role-binding-default"
CLUSTER_ID="flink-native-k8s-session-1"
FLINK_IMAGE_NAME="test_kubernetes_session"
LOCAL_OUTPUT_PATH="${TEST_DATA_DIR}/out/wc_out"
OUTPUT_PATH="/tmp/wc_out"
ARGS="--output ${OUTPUT_PATH}"

function cleanup {
    kubectl delete service ${CLUSTER_ID}
    kubectl delete clusterrolebinding ${CLUSTER_ROLE_BINDING}
    stop_kubernetes
}

start_kubernetes


echo "some debugging before starting the session"
docker ps
kubectl get pods --all-namespaces

cd "$DOCKER_MODULE_DIR"
# Build a Flink image without any user jars
./build.sh --from-local-dist --job-artifacts ${TEST_INFRA_DIR}/test-data/words --image-name ${FLINK_IMAGE_NAME}

kubectl create clusterrolebinding ${CLUSTER_ROLE_BINDING} --clusterrole=edit --serviceaccount=default:default --namespace=default

mkdir -p "$(dirname $LOCAL_OUTPUT_PATH)"

# Set the memory and cpu smaller than default, so that the jobmanager and taskmanager pods could be allocated in minikube.
"$FLINK_DIR"/bin/kubernetes-session.sh -Dkubernetes.cluster-id=${CLUSTER_ID} \
    -Dkubernetes.container.image=${FLINK_IMAGE_NAME} \
    -Djobmanager.heap.size=512m \
    -Dcontainerized.heap-cutoff-min=100 \
    -Dkubernetes.jobmanager.cpu=0.5 \
    -Dkubernetes.taskmanager.cpu=0.5

echo "some debugging after starting the session"
docker ps
kubectl get pods --all-namespaces
sleep 30
docker ps
kubectl get pods --all-namespaces


"$FLINK_DIR"/bin/flink run -e kubernetes-session \
    -Dkubernetes.cluster-id=${CLUSTER_ID} \
    ${FLINK_DIR}/examples/batch/WordCount.jar ${ARGS}

echo "some debugging after submitting the job"
docker ps
kubectl get pods --all-namespaces

kubectl cp `kubectl get pods | awk '/taskmanager/ {print $1}'`:${OUTPUT_PATH} ${LOCAL_OUTPUT_PATH}

check_result_hash "WordCount" "${LOCAL_OUTPUT_PATH}" "${RESULT_HASH}"
