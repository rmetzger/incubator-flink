dependencies {
    implementation(project(":flink-runtime"))
    implementation(project(":flink-clients"))
    implementation(Libs.flink_shaded_hadoop_2)
    testImplementation(project(":flink-test-utils-parent:flink-test-utils"))
    testImplementation(project(":flink-test-utils-parent:flink-test-utils-junit"))
    testImplementation(project(":flink-runtime"))
    testImplementation(Libs.hadoop_hdfs)
    testImplementation(Libs.hadoop_common)
}

description = "flink-yarn"
