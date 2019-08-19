dependencies {
    testImplementation(project(":flink-streaming-java"))
    testImplementation(project(":flink-connectors:flink-connector-gcp-pubsub"))
    testImplementation("com.spotify:docker-client:8.11.7")
    testImplementation(project(":flink-streaming-java"))
    testImplementation(project(":flink-runtime"))
}

description = "flink-connector-gcp-pubsub-emulator-tests"
