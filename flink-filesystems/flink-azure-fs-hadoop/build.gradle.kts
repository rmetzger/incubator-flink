dependencies {
    implementation(project(":flink-filesystems:flink-hadoop-fs"))
    implementation(project(":flink-filesystems:flink-fs-hadoop-shaded"))
    implementation("org.apache.hadoop:hadoop-azure:3.1.0")
    testImplementation("com.microsoft.azure:azure:1.16.0")
    testImplementation(project(":flink-core"))
    compileOnly(project(":flink-core"))
}

description = "flink-azure-fs-hadoop"
