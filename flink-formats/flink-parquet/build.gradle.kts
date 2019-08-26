dependencies {
    implementation(Libs.parquet_hadoop)
    implementation(Libs.parquet_avro)
    testImplementation(project(":flink-test-utils-parent:flink-test-utils"))
    testImplementation(project(":flink-streaming-java"))
    testImplementation(project(":flink-formats:flink-avro"))
    compileOnly(project(":flink-core"))
    compileOnly(project(":flink-table:flink-table-common"))
    compileOnly(project(":flink-table:flink-table-api-java-bridge"))
    compileOnly(project(":flink-table:flink-table-planner"))
    compileOnly(Libs.flink_shaded_hadoop_2)
    compileOnly(Libs.fastutil)
}

description = "flink-parquet"
