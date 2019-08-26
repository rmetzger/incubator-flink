dependencies {
    implementation(project(":flink-connectors:flink-connector-elasticsearch-base"))
    implementation(Libs.elasticsearch_rest_high_level_client)
    implementation(Libs.log4j_to_slf4j)
    testImplementation(project(":flink-test-utils-parent:flink-test-utils"))
    testImplementation(project(":flink-streaming-java"))
    testImplementation(project(":flink-connectors:flink-connector-elasticsearch-base"))
    testImplementation(Libs.transport)
    testImplementation(Libs.transport_netty4_client)
    testImplementation(Libs.log4j_core)
    testImplementation(project(":flink-table:flink-table-planner"))
    testImplementation(project(":flink-formats:flink-json"))
    compileOnly(project(":flink-streaming-java"))
    compileOnly(project(":flink-table:flink-table-api-java-bridge"))
    compileOnly(project(":flink-table:flink-table-planner"))
}

description = "flink-connector-elasticsearch6"
