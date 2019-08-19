dependencies {
    implementation(project(":flink-filesystems:flink-hadoop-fs"))
    implementation(project(":flink-filesystems:flink-fs-hadoop-shaded"))
    implementation("org.apache.hadoop:hadoop-aliyun:3.1.0")
    implementation("com.aliyun.oss:aliyun-sdk-oss:3.4.1")
    testImplementation(project(path = ":flink-filesystems:flink-fs-hadoop-shaded", configuration = "testArtifacts"))
    testImplementation(project(path = ":flink-core", configuration = "testArtifacts"))
    testImplementation(project(path = ":flink-filesystems:flink-hadoop-fs", configuration = "testArtifacts"))
    testImplementation(project(":flink-test-utils-parent:flink-test-utils-junit"))
    compileOnly(project(":flink-core"))
}
