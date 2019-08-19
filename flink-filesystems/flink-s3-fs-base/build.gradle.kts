dependencies {
    implementation(project(":flink-filesystems:flink-fs-hadoop-shaded"))
    implementation(project(":flink-filesystems:flink-hadoop-fs"))
    implementation("com.amazonaws:aws-java-sdk-core:1.11.271")
    implementation("com.amazonaws:aws-java-sdk-s3:1.11.271")
    implementation("com.amazonaws:aws-java-sdk-kms:1.11.271")
    implementation("com.amazonaws:aws-java-sdk-dynamodb:1.11.271")
    implementation("org.apache.hadoop:hadoop-aws:3.1.0")
    compileOnly(project(":flink-core"))
}

description = "flink-s3-fs-base"
