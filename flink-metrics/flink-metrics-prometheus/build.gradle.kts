dependencies {
    implementation("io.prometheus:simpleclient:0.3.0")
    implementation("io.prometheus:simpleclient_httpserver:0.3.0")
    implementation("io.prometheus:simpleclient_pushgateway:0.3.0")
    testImplementation(project(":flink-metrics:flink-metrics-core"))
    testImplementation(project(":flink-test-utils-parent:flink-test-utils-junit"))
    testImplementation("com.mashape.unirest:unirest-java:1.4.9")
    compileOnly(project(":flink-annotations"))
    compileOnly(project(":flink-core"))
    compileOnly(project(":flink-runtime"))
    compileOnly(project(":flink-metrics:flink-metrics-core"))
}

description = "flink-metrics-prometheus"
