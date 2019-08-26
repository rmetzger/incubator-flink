dependencies {
    testImplementation(Libs.flink_shaded_hadoop_2)
    testImplementation(project(":flink-streaming-java"))
    testImplementation(project(":flink-examples:flink-examples-batch"))
    testImplementation(project(":flink-formats:flink-avro"))
    testImplementation(project(":flink-test-utils-parent:flink-test-utils-junit"))
    testImplementation(project(":flink-test-utils-parent:flink-test-utils"))
    testImplementation(project(":flink-runtime"))
    testImplementation(project(":flink-core"))
    testImplementation(Libs.hadoop_hdfs)
    testImplementation(Libs.hadoop_common)
}

description = "flink-fs-tests"
