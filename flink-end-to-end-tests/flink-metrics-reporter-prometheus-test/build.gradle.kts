dependencies {
    testImplementation(project(":flink-core"))
    testImplementation(project(":flink-metrics:flink-metrics-prometheus"))
    testImplementation(Libs.okhttp)
    testImplementation(Libs.flink_shaded_jackson)
    testImplementation(project(":flink-end-to-end-tests:flink-end-to-end-tests-common"))
    testImplementation(project(":flink-test-utils-parent:flink-test-utils-junit"))
}
