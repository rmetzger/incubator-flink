dependencies {
    implementation(project(":flink-filesystems:flink-hadoop-fs"))
    implementation(Libs.hadoop_client)
    implementation(Libs.hadoop_openstack)
    compileOnly(project(":flink-core"))
    testImplementation(project(":flink-test-utils-parent:flink-test-utils-junit"))
}

description = "flink-swift-fs-hadoop"
