dependencies {
    implementation(project(":flink-connectors:flink-connector-elasticsearch6"))
    compileOnly(project(":flink-streaming-java"))
}

description = "flink-elasticsearch6-test"
