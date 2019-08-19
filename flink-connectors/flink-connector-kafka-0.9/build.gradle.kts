dependencies {
    implementation(project(":flink-connectors:flink-connector-kafka-base")) {
        exclude(group = "org.apache.kafka", module = "kafka_${Versions.baseScala}")
        exclude(group = "org.apache.kafka", module = "kafka-clients")
    }
    implementation("org.apache.kafka:kafka-clients:0.9.0.1")
    testImplementation(project(":flink-streaming-java"))
    testImplementation(project(":flink-connectors:flink-connector-kafka-base"))
    testImplementation(project(":flink-metrics:flink-metrics-jmx"))
    testImplementation(project(":flink-tests"))
    testImplementation(project(":flink-test-utils-parent:flink-test-utils"))
    testImplementation(project(":flink-runtime"))
    testImplementation(project(":flink-table:flink-table-planner"))
    testImplementation("org.apache.hadoop:hadoop-minikdc:2.7.2")
    testImplementation("org.apache.kafka:kafka:0.9.0.1")
    compileOnly(project(":flink-streaming-java"))
    compileOnly(project(":flink-table:flink-table-api-java-bridge"))
    compileOnly(project(":flink-table:flink-table-planner"))
}

description = "flink-connector-kafka-0.9"
