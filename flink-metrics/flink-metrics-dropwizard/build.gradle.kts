dependencies {
    implementation("io.dropwizard.metrics:metrics-core:3.1.5")
    testImplementation(project(":flink-metrics:flink-metrics-core"))
    testImplementation(project(":flink-core"))
    testImplementation(project(":flink-runtime"))
    testImplementation(project(":flink-test-utils-parent:flink-test-utils-junit"))
    compileOnly(project(":flink-annotations"))
    compileOnly(project(":flink-metrics:flink-metrics-core"))
}

description = "flink-metrics-dropwizard"
