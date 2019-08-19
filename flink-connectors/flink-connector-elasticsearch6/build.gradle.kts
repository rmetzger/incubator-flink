dependencies {
    implementation(project(":flink-connectors:flink-connector-elasticsearch-base"))
    implementation("org.elasticsearch.client:elasticsearch-rest-high-level-client:6.3.1")
    implementation("org.apache.logging.log4j:log4j-to-slf4j:2.9.1")
    testImplementation(project(":flink-test-utils-parent:flink-test-utils"))
    testImplementation(project(":flink-streaming-java"))
    testImplementation(project(":flink-connectors:flink-connector-elasticsearch-base"))
    testImplementation("org.elasticsearch.client:transport:6.3.1")
    testImplementation("org.elasticsearch.plugin:transport-netty4-client:6.3.1")
    testImplementation("org.apache.logging.log4j:log4j-core:2.9.1")
    testImplementation(project(":flink-table:flink-table-planner"))
    testImplementation(project(":flink-formats:flink-json"))
    compileOnly(project(":flink-streaming-java"))
    compileOnly(project(":flink-table:flink-table-api-java-bridge"))
    compileOnly(project(":flink-table:flink-table-planner"))
}

description = "flink-connector-elasticsearch6"
