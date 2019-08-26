dependencies {
    implementation(Libs.influxdb_java)
    testImplementation(project(":flink-metrics:flink-metrics-core"))
    testImplementation(project(":flink-test-utils-parent:flink-test-utils-junit"))
    testImplementation(Libs.wiremock)
    compileOnly(project(":flink-core"))
    compileOnly(project(":flink-runtime"))
    compileOnly(project(":flink-metrics:flink-metrics-core"))
}

description = "flink-metrics-influxdb"
