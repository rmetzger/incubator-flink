dependencies {
    testImplementation(project(":flink-core"))
    testImplementation(project(":flink-metrics:flink-metrics-prometheus"))
    testImplementation("com.squareup.okhttp3:okhttp:3.7.0")
    testImplementation("org.apache.flink:flink-shaded-jackson:2.9.8-7.0")
    testImplementation(project(":flink-end-to-end-tests:flink-end-to-end-tests-common"))
    testImplementation(project(":flink-test-utils-parent:flink-test-utils-junit"))
}
