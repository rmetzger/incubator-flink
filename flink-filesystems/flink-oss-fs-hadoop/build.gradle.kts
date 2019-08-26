dependencies {
    implementation(project(":flink-filesystems:flink-hadoop-fs"))
    implementation(project(":flink-filesystems:flink-fs-hadoop-shaded"))
    implementation(Libs.hadoop_aliyun)
    implementation(Libs.aliyun_sdk_oss)
    testImplementation(project(path = ":flink-filesystems:flink-fs-hadoop-shaded", configuration = "testArtifacts"))
    testImplementation(project(path = ":flink-core", configuration = "testArtifacts"))
    testImplementation(project(path = ":flink-filesystems:flink-hadoop-fs", configuration = "testArtifacts"))
    testImplementation(project(":flink-test-utils-parent:flink-test-utils-junit"))
    compileOnly(project(":flink-core"))
}
