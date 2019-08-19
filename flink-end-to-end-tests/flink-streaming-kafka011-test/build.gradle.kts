dependencies {
    implementation(project(":flink-end-to-end-tests:flink-streaming-kafka-test-base"))
    implementation(project(":flink-connectors:flink-connector-kafka-0.11"))
    implementation(project(":flink-streaming-java"))
}

description = "flink-streaming-kafka011-test"
