dependencies {
    implementation(Libs.hbase_server)
    testImplementation(project(":flink-clients"))
    testImplementation(project(":flink-connectors:flink-hadoop-compatibility"))
    testImplementation(Libs.hbase_server)
    testImplementation(Libs.hadoop_minicluster)
    testImplementation(Libs.hbase_hadoop_compat)
    testImplementation(Libs.hadoop_hdfs)
    testImplementation(Libs.hbase_hadoop2_compat)
    testImplementation(project(":flink-test-utils-parent:flink-test-utils"))
    testImplementation(project(":flink-table:flink-table-planner"))
    testImplementation(project(":flink-table:flink-table-planner"))
    testImplementation(project(":flink-table:flink-table-planner-blink"))
    testImplementation(project(":flink-table:flink-table-planner-blink"))
    compileOnly(project(":flink-core"))
    compileOnly(project(":flink-java"))
    compileOnly(project(":flink-scala"))
    compileOnly(project(":flink-streaming-scala"))
    compileOnly(project(":flink-table:flink-table-api-java-bridge"))
    compileOnly(project(":flink-streaming-java"))
    compileOnly(Libs.flink_shaded_hadoop_2)
}

description = "flink-hbase"
