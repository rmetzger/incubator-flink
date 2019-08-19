dependencies {
    implementation(project(":flink-formats:flink-avro"))
    compileOnly(project(":flink-java"))
    compileOnly(project(":flink-streaming-java"))
}

description = "flink-state-evolution-test"
