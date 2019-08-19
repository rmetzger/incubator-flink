dependencies {
    implementation(project(":flink-quickstart:flink-quickstart-java"))
    implementation(project(":flink-quickstart:flink-quickstart-scala"))
    implementation(project(":flink-connectors:flink-connector-elasticsearch5"))
    compileOnly(project(":flink-streaming-java"))
    compileOnly(project(":flink-streaming-scala"))
}

description = "flink-quickstart-test"
