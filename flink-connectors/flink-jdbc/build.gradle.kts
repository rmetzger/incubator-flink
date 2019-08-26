dependencies {
    testImplementation(Libs.derby)
    testImplementation(project(":flink-test-utils-parent:flink-test-utils"))
    testImplementation(project(":flink-table:flink-table-planner"))
    compileOnly(project(":flink-table:flink-table-api-java-bridge"))
    compileOnly(project(":flink-table:flink-table-planner"))
    compileOnly(project(":flink-streaming-java"))
}

description = "flink-jdbc"
