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
    testImplementation(Libs.hadoop_common)
    testImplementation(Libs.hadoop_yarn_client)
    testImplementation(Libs.hadoop_yarn_api)
    testImplementation(Libs.hadoop_minicluster)
    testImplementation(Libs.hadoop_minikdc)
}

description = "flink-yarn-tests"
