dependencies {
    testImplementation(project(":flink-test-utils-parent:flink-test-utils"))
    testImplementation(project(":flink-streaming-java"))
    testImplementation(project(":flink-connectors:flink-hadoop-compatibility"))
    compileOnly(project(":flink-core"))
    compileOnly("org.apache.flink:flink-shaded-hadoop-2:2.4.1-7.0")
}

description = "flink-sequence-file"
