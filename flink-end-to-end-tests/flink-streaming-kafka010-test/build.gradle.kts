dependencies {
    implementation(project(":flink-end-to-end-tests:flink-streaming-kafka-test-base"))
    implementation(project(":flink-connectors:flink-connector-kafka-0.10"))
    implementation(project(":flink-streaming-java"))
}

description = "flink-streaming-kafka010-test"
