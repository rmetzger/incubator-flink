dependencies {
    implementation(project(":flink-filesystems:flink-hadoop-fs"))
    implementation("org.apache.hadoop:hadoop-client:2.8.1")
    implementation("org.apache.hadoop:hadoop-openstack:2.8.1")
    compileOnly(project(":flink-core"))
    testImplementation(project(":flink-test-utils-parent:flink-test-utils-junit"))
}

description = "flink-swift-fs-hadoop"
