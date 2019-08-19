dependencies {
    implementation(project(":flink-connectors:flink-connector-kafka-0.9"))
    implementation("org.apache.kafka:kafka-clients:0.10.2.1")
    testImplementation(project(":flink-streaming-java"))
    testImplementation(project(":flink-connectors:flink-connector-kafka-0.9"))
    testImplementation(project(":flink-connectors:flink-connector-kafka-base"))
    testImplementation("org.apache.kafka:kafka:0.10.2.1")
    testImplementation(project(":flink-tests"))
    testImplementation(project(":flink-test-utils-parent:flink-test-utils"))
    testImplementation(project(":flink-runtime"))
    testImplementation(project(":flink-metrics:flink-metrics-jmx"))
    testImplementation(project(":flink-table:flink-table-planner"))
    compileOnly(project(":flink-streaming-java"))
    compileOnly(project(":flink-table:flink-table-api-java-bridge"))
    compileOnly(project(":flink-table:flink-table-planner"))
}

description = "flink-connector-kafka-0.10"
