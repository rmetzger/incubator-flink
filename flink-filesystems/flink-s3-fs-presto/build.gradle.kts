dependencies {
    implementation(project(":flink-filesystems:flink-s3-fs-base"))
    implementation("com.facebook.presto:presto-hive:0.187")
    implementation("com.facebook.presto.hadoop:hadoop-apache2:2.7.3-1")
    testImplementation(project(":flink-core"))
    testImplementation(project(":flink-filesystems:flink-hadoop-fs"))
    compileOnly(project(":flink-core"))
}

description = "flink-s3-fs-presto"
