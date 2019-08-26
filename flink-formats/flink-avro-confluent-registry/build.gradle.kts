dependencies {
    implementation(Libs.kafka_schema_registry_client)
    implementation(project(":flink-formats:flink-avro"))
    compileOnly(project(":flink-core"))
}
