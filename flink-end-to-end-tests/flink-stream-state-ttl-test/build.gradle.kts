dependencies {
    implementation(project(":flink-end-to-end-tests:flink-datastream-allround-test"))
    implementation(project(":flink-state-backends:flink-statebackend-rocksdb"))
    compileOnly(project(":flink-streaming-java"))
}

description = "flink-stream-state-ttl-test"
