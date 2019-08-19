dependencies {
    implementation(project(":flink-connectors:flink-connector-elasticsearch2"))
    compileOnly(project(":flink-streaming-java"))
}

description = "flink-elasticsearch2-test"
