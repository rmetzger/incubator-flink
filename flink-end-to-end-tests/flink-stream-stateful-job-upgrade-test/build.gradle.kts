dependencies {
    implementation(project(":flink-end-to-end-tests:flink-datastream-allround-test"))
    compileOnly(project(":flink-streaming-java"))
}

description = "flink-stream-stateful-job-upgrade-test"
