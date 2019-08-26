dependencies {
    testImplementation(project(":flink-test-utils-parent:flink-test-utils"))
    testImplementation(project(":flink-streaming-java"))
    testImplementation(project(":flink-connectors:flink-hadoop-compatibility"))
    compileOnly(project(":flink-core"))
    compileOnly(Libs.flink_shaded_hadoop_2)
}

description = "flink-sequence-file"
