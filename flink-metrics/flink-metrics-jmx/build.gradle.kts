dependencies {
    testImplementation(project(":flink-metrics:flink-metrics-core"))
    testImplementation(project(":flink-runtime"))
    testImplementation(project(":flink-test-utils-parent:flink-test-utils-junit"))
    testImplementation(project(":flink-test-utils-parent:flink-test-utils"))
    compileOnly(project(":flink-annotations"))
    compileOnly(project(":flink-core"))
    compileOnly(project(":flink-runtime"))
    compileOnly(project(":flink-metrics:flink-metrics-core"))
}

description = "flink-metrics-jmx"
