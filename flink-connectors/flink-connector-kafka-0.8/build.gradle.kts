dependencies {
    implementation(project(":flink-connectors:flink-connector-kafka-base")) {
        exclude(group = "org.apache.kafka", module = "kafka-clients")
    }
    implementation(Libs.kafka_2_11)
    testImplementation(project(":flink-streaming-java"))
    testImplementation(Libs.curator_test)
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
