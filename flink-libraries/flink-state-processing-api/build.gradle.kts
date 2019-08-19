dependencies {
    testImplementation(project(":flink-state-backends:flink-statebackend-rocksdb"))
    testImplementation(project(":flink-streaming-java"))
    testImplementation(project(":flink-test-utils-parent:flink-test-utils"))
    testImplementation(project(":flink-tests"))
    testImplementation(project(":flink-runtime"))
    testImplementation(project(":flink-core"))
    compileOnly(project(":flink-streaming-java"))
    compileOnly(project(":flink-java"))
}

description = "flink-state-processor-api(")
