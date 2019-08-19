dependencies {
    compileOnly(project(":flink-table:flink-table-common"))
    compileOnly(project(":flink-formats:flink-avro"))
    compileOnly(project(":flink-formats:flink-json"))
    compileOnly(project(":flink-formats:flink-csv"))
    compileOnly(project(":flink-connectors:flink-sql-connector-kafka-0.9"))
    compileOnly(project(":flink-connectors:flink-sql-connector-kafka-0.10"))
    compileOnly(project(":flink-connectors:flink-sql-connector-kafka-0.11"))
    compileOnly(project(":flink-connectors:flink-sql-connector-kafka"))
    compileOnly(project(":flink-connectors:flink-sql-connector-elasticsearch6"))
}

description = "flink-sql-client-test"
