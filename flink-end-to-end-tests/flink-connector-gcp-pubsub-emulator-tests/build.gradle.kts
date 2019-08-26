dependencies {
    testImplementation(project(":flink-streaming-java"))
    testImplementation(project(":flink-connectors:flink-connector-gcp-pubsub"))
    testImplementation(Libs.docker_client)
    testImplementation(project(":flink-streaming-java"))
    testImplementation(project(":flink-runtime"))
}

description = "flink-connector-gcp-pubsub-emulator-tests"
