dependencies {
    implementation(project(":flink-connectors:flink-connector-filesystem"))
    compileOnly(project(":flink-streaming-java"))
    compileOnly(Libs.flink_shaded_hadoop_2)
}

description = "flink-bucketing-sink-test"
