dependencies {
    implementation(project(":flink-formats:flink-avro"))
    testImplementation(project(":flink-test-utils-parent:flink-test-utils"))
    testImplementation(project(":flink-connectors:flink-hadoop-compatibility"))
    testImplementation(project(":flink-streaming-java"))
    testImplementation(project(":flink-core"))
    testImplementation(project(":flink-tests"))
    testImplementation(project(":flink-runtime"))
    testImplementation(Libs.hadoop_hdfs)
    testImplementation(Libs.hadoop_common)
    testImplementation(Libs.hadoop_minikdc)
    compileOnly(project(":flink-streaming-java"))
    compileOnly(Libs.flink_shaded_hadoop_2)
}

description = "flink-connector-filesystem"
