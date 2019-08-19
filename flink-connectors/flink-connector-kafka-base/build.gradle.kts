dependencies {
    implementation("org.apache.kafka:kafka-clients:0.10.2.1")
    testImplementation("org.apache.kafka:kafka:0.10.2.1")
    testImplementation("com.101tec:zkclient:0.7")
    testImplementation("org.apache.curator:curator-test:2.12.0")
    testImplementation(project(":flink-metrics:flink-metrics-jmx"))
    testImplementation(project(":flink-streaming-java"))
    testImplementation(project(":flink-test-utils-parent:flink-test-utils"))
    testImplementation(project(":flink-tests"))
    testImplementation(project(":flink-runtime"))
    testImplementation(project(":flink-core"))
    testImplementation(project(":flink-table:flink-table-planner"))
    testImplementation(project(":flink-table:flink-table-common"))
    testImplementation("org.apache.hadoop:hadoop-minikdc:2.7.2")
    compileOnly("org.apache.flink:flink-shaded-jackson:2.9.8-7.0")
    compileOnly(project(":flink-streaming-java"))
    compileOnly(project(":flink-table:flink-table-api-java-bridge"))
    compileOnly(project(":flink-table:flink-table-planner"))
}

description = "flink-connector-kafka-base"
