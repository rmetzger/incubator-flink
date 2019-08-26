dependencies {
    implementation(project(":flink-core"))
    implementation(project(":flink-filesystems:flink-hadoop-fs"))
    implementation(Libs.flink_shaded_hadoop_2)
    testImplementation(project(":flink-test-utils-parent:flink-test-utils-junit"))
}

description = "flink-mapr-fs"
