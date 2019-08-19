dependencies {
    implementation("org.apache.hbase:hbase-server:1.4.3")
    testImplementation(project(":flink-clients"))
    testImplementation(project(":flink-connectors:flink-hadoop-compatibility"))
    testImplementation("org.apache.hbase:hbase-server:1.4.3")
    testImplementation("org.apache.hadoop:hadoop-minicluster:2.4.1")
    testImplementation("org.apache.hbase:hbase-hadoop-compat:1.4.3")
    testImplementation("org.apache.hadoop:hadoop-hdfs:2.4.1")
    testImplementation("org.apache.hbase:hbase-hadoop2-compat:1.4.3")
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
    compileOnly("org.apache.flink:flink-shaded-hadoop-2:2.4.1-7.0")
}

description = "flink-hbase"
