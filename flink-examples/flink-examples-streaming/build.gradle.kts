dependencies {
    implementation(project(":flink-streaming-java"))
    implementation(project(":flink-streaming-scala"))
    implementation(project(":flink-connectors:flink-connector-twitter"))
    implementation(project(":flink-connectors:flink-connector-kafka"))
    implementation(Libs.flink_shaded_jackson)
    implementation(project(":flink-state-backends:flink-statebackend-rocksdb"))
    testImplementation(project(":flink-test-utils-parent:flink-test-utils"))
    testImplementation(project(":flink-streaming-java"))
}

description = "flink-examples-streaming"
