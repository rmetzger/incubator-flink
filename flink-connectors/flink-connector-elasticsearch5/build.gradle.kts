dependencies {
    implementation(project(":flink-connectors:flink-connector-elasticsearch-base"))
    implementation(Libs.transport)
    implementation(Libs.log4j_to_slf4j)
    testImplementation(project(":flink-test-utils-parent:flink-test-utils"))
    testImplementation(project(":flink-streaming-java"))
    testImplementation(project(":flink-connectors:flink-connector-elasticsearch-base"))
    testImplementation(Libs.log4j_core)
    compileOnly(project(":flink-streaming-java"))
}

description = "flink-connector-elasticsearch5"
