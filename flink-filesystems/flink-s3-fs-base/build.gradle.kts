dependencies {
    implementation(project(":flink-filesystems:flink-fs-hadoop-shaded"))
    implementation(project(":flink-filesystems:flink-hadoop-fs"))
    implementation(Libs.aws_java_sdk_core)
    implementation(Libs.aws_java_sdk_s3)
    implementation(Libs.aws_java_sdk_kms)
    implementation(Libs.aws_java_sdk_dynamodb)
    implementation(Libs.hadoop_aws)
    compileOnly(project(":flink-core"))
}

description = "flink-s3-fs-base"
