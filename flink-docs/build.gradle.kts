dependencies {
    implementation(project(":flink-annotations"))
    implementation(project(":flink-core"))
    implementation(project(":flink-java"))
    implementation(project(":flink-runtime"))
    implementation(project(path = ":flink-runtime", configuration = "testArtifacts"))
    implementation(project(":flink-table:flink-table-api-java"))
    implementation(project(":flink-metrics:flink-metrics-prometheus"))
    implementation(project(":flink-runtime-web"))
    implementation(project(":flink-yarn"))
    implementation(project(":flink-mesos"))
    implementation("org.apache.flink:flink-shaded-netty:4.1.32.Final-7.0")
    implementation("org.apache.flink:flink-shaded-jackson-module-jsonSchema:2.9.8-7.0")
    implementation(project(":flink-state-backends:flink-statebackend-rocksdb"))
    testImplementation("org.jsoup:jsoup:1.11.2")
}

description = "flink-docs"
