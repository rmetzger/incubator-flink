dependencies {
    implementation(project(":flink-formats:flink-avro"))
    testImplementation(project(":flink-test-utils-parent:flink-test-utils"))
    compileOnly(project(":flink-streaming-java"))
    compileOnly(project(":flink-state-backends:flink-statebackend-rocksdb"))
}

description = "flink-datastream-allround-test"
