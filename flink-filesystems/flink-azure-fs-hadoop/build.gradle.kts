dependencies {
    implementation(project(":flink-filesystems:flink-hadoop-fs"))
    implementation(project(":flink-filesystems:flink-fs-hadoop-shaded"))
    implementation(Libs.hadoop_azure)
    testImplementation(Libs.azure)
    testImplementation(project(":flink-core"))
    compileOnly(project(":flink-core"))
}

description = "flink-azure-fs-hadoop"
