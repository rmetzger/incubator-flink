dependencies {
    implementation(project(":flink-end-to-end-tests:flink-streaming-kafka-test-base"))
    implementation(project(":flink-connectors:flink-connector-kafka"))
    implementation(project(":flink-streaming-java"))
}

description = "flink-streaming-kafka-test"
