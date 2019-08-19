dependencies {
    implementation(project(":flink-connectors:flink-connector-elasticsearch-base"))
    implementation("org.elasticsearch:elasticsearch:2.3.5")
    testImplementation(project(":flink-test-utils-parent:flink-test-utils"))
    testImplementation(project(":flink-streaming-java"))
    testImplementation(project(":flink-connectors:flink-connector-elasticsearch-base"))
    compileOnly(project(":flink-streaming-java"))
}

description = "flink-connector-elasticsearch2"
