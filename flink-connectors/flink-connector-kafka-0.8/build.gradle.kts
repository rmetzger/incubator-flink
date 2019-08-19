dependencies {
    implementation(project(":flink-connectors:flink-connector-kafka-base")) {
        exclude(group = "org.apache.kafka", module = "kafka-clients")
    }
    implementation("org.apache.kafka:kafka_${Versions.baseScala}:0.8.2.2")
    testImplementation(project(":flink-streaming-java"))
    testImplementation("org.apache.curator:curator-test:2.12.0")
    testImplementation(project(":flink-metrics:flink-metrics-jmx"))
    testImplementation(project(":flink-connectors:flink-connector-kafka-base"))
    testImplementation(project(":flink-runtime"))
    testImplementation(project(":flink-test-utils-parent:flink-test-utils"))
    testImplementation(project(":flink-tests"))
    testImplementation(project(":flink-table:flink-table-planner"))
    compileOnly(project(":flink-streaming-java"))
    compileOnly(project(":flink-shaded-curator"))
    compileOnly(project(":flink-table:flink-table-api-java-bridge"))
    compileOnly(project(":flink-table:flink-table-planner"))
}

description = "flink-connector-kafka-0.8"
