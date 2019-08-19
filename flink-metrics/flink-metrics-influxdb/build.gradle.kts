dependencies {
    implementation("org.influxdb:influxdb-java:2.14")
    testImplementation(project(":flink-metrics:flink-metrics-core"))
    testImplementation(project(":flink-test-utils-parent:flink-test-utils-junit"))
    testImplementation("com.github.tomakehurst:wiremock:2.19.0")
    compileOnly(project(":flink-core"))
    compileOnly(project(":flink-runtime"))
    compileOnly(project(":flink-metrics:flink-metrics-core"))
}

description = "flink-metrics-influxdb"
