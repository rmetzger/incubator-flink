dependencies {
    testImplementation("org.apache.flink:flink-shaded-hadoop-2:2.4.1-7.0")
    testImplementation(project(":flink-streaming-java"))
    testImplementation(project(":flink-examples:flink-examples-batch"))
    testImplementation(project(":flink-formats:flink-avro"))
    testImplementation(project(":flink-test-utils-parent:flink-test-utils-junit"))
    testImplementation(project(":flink-test-utils-parent:flink-test-utils"))
    testImplementation(project(":flink-runtime"))
    testImplementation(project(":flink-core"))
    testImplementation("org.apache.hadoop:hadoop-hdfs:2.4.1")
    testImplementation("org.apache.hadoop:hadoop-common:2.4.1")
}

description = "flink-fs-tests"
