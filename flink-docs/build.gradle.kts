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
    implementation(Libs.flink_shaded_netty)
    implementation(Libs.flink_shaded_jackson_module_jsonschema)
    implementation(project(":flink-state-backends:flink-statebackend-rocksdb"))
    testImplementation(Libs.jsoup)
}

description = "flink-docs"
