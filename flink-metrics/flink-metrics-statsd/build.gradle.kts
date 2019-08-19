dependencies {
    implementation("org.slf4j:slf4j-api:1.7.15")
    testImplementation(project(":flink-metrics:flink-metrics-core"))
    testImplementation(project(":flink-core"))
    testImplementation(project(":flink-runtime"))
    testImplementation(project(":flink-test-utils-parent:flink-test-utils-junit"))
    compileOnly(project(":flink-annotations"))
    compileOnly(project(":flink-metrics:flink-metrics-core"))
}

description = "flink-metrics-statsd"
