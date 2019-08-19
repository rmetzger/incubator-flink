dependencies {
    testImplementation(project(":flink-test-utils-parent:flink-test-utils-junit"))
    testImplementation(project(":flink-test-utils-parent:flink-test-utils"))
    testImplementation(project(":flink-dist"))
    testImplementation(project(":flink-runtime"))
    testImplementation(project(":flink-clients"))
    testImplementation(project(":flink-streaming-java"))
    testImplementation(project(":flink-yarn"))
    testImplementation(project(":flink-yarn"))
    testImplementation(project(":flink-examples:flink-examples-batch"))
    testImplementation(project(":flink-examples:flink-examples-streaming"))
    testImplementation("org.apache.hadoop:hadoop-common:2.4.1")
    testImplementation("org.apache.hadoop:hadoop-yarn-client:2.4.1")
    testImplementation("org.apache.hadoop:hadoop-yarn-:2.4.1")
    testImplementation("org.apache.hadoop:hadoop-minicluster:2.4.1")
    testImplementation("org.apache.hadoop:hadoop-minikdc:2.7.2")
}

description = "flink-yarn-tests"
