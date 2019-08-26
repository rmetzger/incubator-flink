dependencies {
    implementation(project(":flink-connectors:flink-connector-elasticsearch-base"))
    implementation(Libs.elasticsearch)
    testImplementation(project(":flink-test-utils-parent:flink-test-utils"))
    testImplementation(project(":flink-streaming-java"))
    testImplementation(project(":flink-connectors:flink-connector-elasticsearch-base"))
    compileOnly(project(":flink-streaming-java"))
}

description = "flink-connector-elasticsearch2"
