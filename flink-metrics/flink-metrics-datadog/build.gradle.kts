dependencies {
    implementation("org.slf4j:slf4j-api:1.7.15")
    implementation("com.squareup.okhttp3:okhttp:3.7.0")
    compileOnly(project(":flink-metrics:flink-metrics-core"))
    compileOnly("org.apache.flink:flink-shaded-jackson:2.9.8-7.0")
    testImplementation(project(":flink-metrics:flink-metrics-core"))
    testImplementation("org.apache.flink:flink-shaded-jackson:2.9.8-7.0")
}

description = "flink-metrics-datadog"
