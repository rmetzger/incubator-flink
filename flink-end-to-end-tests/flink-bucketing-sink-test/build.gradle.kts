dependencies {
    implementation(project(":flink-connectors:flink-connector-filesystem"))
    compileOnly(project(":flink-streaming-java"))
    compileOnly("org.apache.flink:flink-shaded-hadoop-2:2.4.1-7.0")
}

description = "flink-bucketing-sink-test"
