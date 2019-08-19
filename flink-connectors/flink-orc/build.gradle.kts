dependencies {
    implementation("org.apache.orc:orc-core:1.4.3")
    testImplementation(project(":flink-test-utils-parent:flink-test-utils"))
    testImplementation(project(":flink-clients"))
    testImplementation(project(":flink-core"))
    compileOnly(project(":flink-streaming-scala"))
    compileOnly(project(":flink-table:flink-table-api-java-bridge"))
    compileOnly(project(":flink-table:flink-table-planner"))
    compileOnly("org.apache.flink:flink-shaded-hadoop-2:2.4.1-7.0")
}

description = "flink-orc"
