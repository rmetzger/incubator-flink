dependencies {
    implementation(project(":flink-filesystems:flink-s3-fs-base"))
    implementation(Libs.presto_hive)
    implementation(Libs.hadoop_apache2)
    testImplementation(project(":flink-core"))
    testImplementation(project(":flink-filesystems:flink-hadoop-fs"))
    compileOnly(project(":flink-core"))
}

description = "flink-s3-fs-presto"
