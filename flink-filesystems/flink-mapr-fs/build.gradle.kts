dependencies {
    implementation(project(":flink-core"))
    implementation(project(":flink-filesystems:flink-hadoop-fs"))
    implementation("org.apache.flink:flink-shaded-hadoop-2:2.4.1-7.0")
    testImplementation(project(":flink-test-utils-parent:flink-test-utils-junit"))
}

description = "flink-mapr-fs"
