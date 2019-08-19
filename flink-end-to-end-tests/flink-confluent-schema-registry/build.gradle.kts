dependencies {
    implementation(project(":flink-connectors:flink-connector-kafka-0.10"))
    implementation(project(":flink-formats:flink-avro"))
    implementation(project(":flink-formats:flink-avro-confluent-registry"))
    compileOnly(project(":flink-streaming-java"))
}
