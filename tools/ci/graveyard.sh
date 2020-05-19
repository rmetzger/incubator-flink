PYTHON_TEST="./flink-python/dev/lint-python.sh"
PYTHON_PID="${ARTIFACTS_DIR}/watchdog.python.pid"
PYTHON_EXIT="${ARTIFACTS_DIR}/watchdog.python.exit"
PYTHON_OUT="${ARTIFACTS_DIR}/python.out"




MVN_PID="${ARTIFACTS_DIR}/watchdog.mvn.pid"
MVN_EXIT="${ARTIFACTS_DIR}/watchdog.mvn.exit"
MVN_OUT="${ARTIFACTS_DIR}/mvn.out"


if [ $TEST == $STAGE_PYTHON ]; then
	CMD=$PYTHON_TEST
	CMD_PID=$PYTHON_PID
	CMD_OUT=$PYTHON_OUT
	CMD_EXIT=$PYTHON_EXIT
else
	CMD=$MVN_COMPILE
	CMD_PID=$MVN_PID
	CMD_OUT=$MVN_OUT
	CMD_EXIT=$MVN_EXIT
fi


# E.g. travis-artifacts/apache/flink/1595/1595.1
UPLOAD_TARGET_PATH="travis-artifacts/${TRAVIS_REPO_SLUG}/${TRAVIS_BUILD_NUMBER}/"
# These variables are stored as secure variables in '.travis.yml', which are generated per repo via
# the travis command line tool.
UPLOAD_BUCKET=$ARTIFACTS_AWS_BUCKET
UPLOAD_ACCESS_KEY=$ARTIFACTS_AWS_ACCESS_KEY
UPLOAD_SECRET_KEY=$ARTIFACTS_AWS_SECRET_KEY

ARTIFACTS_FILE=${TRAVIS_JOB_NUMBER}.tar.gz

if [ ! -z "$TF_BUILD" ] ; then
	# set proper artifacts file name on Azure Pipelines
	ARTIFACTS_FILE=${BUILD_BUILDNUMBER}.tar.gz
fi