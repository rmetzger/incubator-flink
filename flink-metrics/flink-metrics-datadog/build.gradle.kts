dependencies {
    implementation(Libs.slf4j_api)
    implementation(Libs.okhttp)
    compileOnly(project(":flink-metrics:flink-metrics-core"))
    compileOnly(Libs.flink_shaded_jackson)
    testImplementation(project(":flink-metrics:flink-metrics-core"))
    testImplementation(Libs.flink_shaded_jackson)
}

description = "flink-metrics-datadog"
