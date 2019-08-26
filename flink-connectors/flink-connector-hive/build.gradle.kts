dependencies {
    testImplementation(project(":flink-table:flink-table-common"))
    testImplementation(project(":flink-table:flink-table-api-java"))
    testImplementation(project(":flink-table:flink-table-planner-blink"))
    testImplementation(project(":flink-table:flink-table-planner"))
    testImplementation(project(":flink-table:flink-table-planner-blink"))
    testImplementation(project(":flink-java"))
    testImplementation(project(":flink-clients"))
    testImplementation(Libs.hiverunner) {
        exclude(group = "javax.jms", module = "jms")
    }
    testImplementation(Libs.reflections)
    testImplementation(Libs.hive_service)
    testImplementation(Libs.hive_hcatalog_core)
    testImplementation(project(":flink-formats:flink-csv"))
    compileOnly(project(":flink-table:flink-table-common"))
    compileOnly(project(":flink-connectors:flink-hadoop-compatibility"))
    compileOnly(project(":flink-table:flink-table-api-java-bridge"))
//    compileOnly(Libs.flink_shaded_hadoop_2_uber)
    compileOnly(Libs.hive_metastore)
    compileOnly(Libs.hive_exec) {
        exclude(group = "org.apache.calcite", module = "calcite-core")
    }
}

description = "flink-connector-hive"
