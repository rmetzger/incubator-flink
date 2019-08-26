dependencies {
    implementation(project(":flink-test-utils-parent:flink-test-utils-junit"))
    implementation(project(":flink-runtime"))
    implementation(project(path = ":flink-runtime", configuration = "testArtifacts"))
    implementation(project(":flink-clients"))
    implementation(project(":flink-streaming-java"))
    implementation(Libs.netty)
    implementation(Libs.curator_test)
    implementation(Libs.hadoop_minikdc)
}

description = "flink-test-utils"
