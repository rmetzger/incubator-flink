dependencies {
    implementation("io.confluent:kafka-schema-registry-client:3.3.1")
    implementation(project(":flink-formats:flink-avro"))
    compileOnly(project(":flink-core"))
}
