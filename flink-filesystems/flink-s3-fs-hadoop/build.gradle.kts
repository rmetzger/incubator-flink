dependencies {
    implementation(project(":flink-filesystems:flink-s3-fs-base"))
    testImplementation(project(":flink-core"))
    testImplementation(project(":flink-filesystems:flink-fs-hadoop-shaded"))
    testImplementation(project(":flink-filesystems:flink-hadoop-fs"))
    compileOnly(project(":flink-core"))
}

description = "flink-s3-fs-hadoop"
