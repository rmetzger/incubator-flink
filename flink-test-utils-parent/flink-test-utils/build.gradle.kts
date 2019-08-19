dependencies {
    implementation(project(":flink-test-utils-parent:flink-test-utils-junit"))
    implementation(project(":flink-runtime"))
    implementation(project(path = ":flink-runtime", configuration = "testArtifacts"))
    implementation(project(":flink-clients"))
    implementation(project(":flink-streaming-java"))
    implementation("io.netty:netty:3.10.6.Final")
    implementation("org.apache.curator:curator-test:2.12.0")
    implementation("org.apache.hadoop:hadoop-minikdc:2.7.2")
}

description = "flink-test-utils"
