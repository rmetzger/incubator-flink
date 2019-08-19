dependencies {
    implementation(project(":flink-connectors:flink-connector-elasticsearch5"))
    compileOnly(project(":flink-streaming-java"))
}

description = "flink-elasticsearch5-test"
