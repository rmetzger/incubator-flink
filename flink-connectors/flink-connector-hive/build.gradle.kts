dependencies {
    testImplementation(project(":flink-table:flink-table-common"))
    testImplementation(project(":flink-table:flink-table-api-java"))
    testImplementation(project(":flink-table:flink-table-planner-blink"))
    testImplementation(project(":flink-table:flink-table-planner"))
    testImplementation(project(":flink-table:flink-table-planner-blink"))
    testImplementation(project(":flink-java"))
    testImplementation(project(":flink-clients"))
    testImplementation("com.klarna:hiverunner:4.0.0")
    testImplementation("org.reflections:reflections:0.9.8")
    testImplementation("org.apache.hive:hive-service:2.3.4")
    testImplementation("org.apache.hive.hcatalog:hive-hcatalog-core:2.3.4")
    testImplementation(project(":flink-formats:flink-csv"))
    compileOnly(project(":flink-table:flink-table-common"))
    compileOnly(project(":flink-connectors:flink-hadoop-compatibility"))
    compileOnly(project(":flink-table:flink-table-api-java-bridge"))
//    compileOnly("org.apache.flink:flink-shaded-hadoop-2-uber:2.7.5-7.0")
    compileOnly("org.apache.hive:hive-metastore:2.3.4")
    compileOnly("org.apache.hive:hive-exec:2.3.4") {
        exclude(group = "org.apache.calcite", module = "calcite-core")
    }
}

description = "flink-connector-hive"
