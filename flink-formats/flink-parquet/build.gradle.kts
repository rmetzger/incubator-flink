dependencies {
    implementation("org.apache.parquet:parquet-hadoop:1.10.0")
    implementation("org.apache.parquet:parquet-avro:1.10.0")
    testImplementation(project(":flink-test-utils-parent:flink-test-utils"))
    testImplementation(project(":flink-streaming-java"))
    testImplementation(project(":flink-formats:flink-avro"))
    compileOnly(project(":flink-core"))
    compileOnly(project(":flink-table:flink-table-common"))
    compileOnly(project(":flink-table:flink-table-api-java-bridge"))
    compileOnly(project(":flink-table:flink-table-planner"))
    compileOnly("org.apache.flink:flink-shaded-hadoop-2:2.4.1-7.0")
    compileOnly("it.unimi.dsi:fastutil:8.2.1")
}

description = "flink-parquet"
