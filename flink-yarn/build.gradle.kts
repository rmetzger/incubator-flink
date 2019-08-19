dependencies {
    implementation(project(":flink-runtime"))
    implementation(project(":flink-clients"))
    implementation("org.apache.flink:flink-shaded-hadoop-2:2.4.1-7.0")
    testImplementation(project(":flink-test-utils-parent:flink-test-utils"))
    testImplementation(project(":flink-test-utils-parent:flink-test-utils-junit"))
    testImplementation(project(":flink-runtime"))
    testImplementation("org.apache.hadoop:hadoop-hdfs:2.4.1")
    testImplementation("org.apache.hadoop:hadoop-common:2.4.1")
}

description = "flink-yarn"
