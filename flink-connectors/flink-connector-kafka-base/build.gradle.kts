dependencies {
    implementation(Libs.kafka_clients)
    testImplementation(Libs.kafka_2_11)
    testImplementation(Libs.zkclient)
    testImplementation(Libs.curator_test)
    testImplementation(project(":flink-metrics:flink-metrics-jmx"))
    testImplementation(project(":flink-streaming-java"))
    testImplementation(project(":flink-test-utils-parent:flink-test-utils"))
    testImplementation(project(":flink-tests"))
    testImplementation(project(":flink-runtime"))
    testImplementation(project(":flink-core"))
    testImplementation(project(":flink-table:flink-table-planner"))
    testImplementation(project(":flink-table:flink-table-common"))
    testImplementation(Libs.hadoop_minikdc)
    compileOnly(Libs.flink_shaded_jackson)
    compileOnly(project(":flink-streaming-java"))
    compileOnly(project(":flink-table:flink-table-api-java-bridge"))
    compileOnly(project(":flink-table:flink-table-planner"))
}

description = "flink-connector-kafka-base"
