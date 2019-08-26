dependencies {
    implementation(Libs.orc_core)
    testImplementation(project(":flink-test-utils-parent:flink-test-utils"))
    testImplementation(project(":flink-clients"))
    testImplementation(project(":flink-core"))
    compileOnly(project(":flink-streaming-scala"))
    compileOnly(project(":flink-table:flink-table-api-java-bridge"))
    compileOnly(project(":flink-table:flink-table-planner"))
    compileOnly(Libs.flink_shaded_hadoop_2)
}

description = "flink-orc"
