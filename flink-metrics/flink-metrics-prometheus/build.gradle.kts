dependencies {
    implementation(Libs.simpleclient)
    implementation(Libs.simpleclient_httpserver)
    implementation(Libs.simpleclient_pushgateway)
    testImplementation(project(":flink-metrics:flink-metrics-core"))
    testImplementation(project(":flink-test-utils-parent:flink-test-utils-junit"))
    testImplementation(Libs.unirest_java)
    compileOnly(project(":flink-annotations"))
    compileOnly(project(":flink-core"))
    compileOnly(project(":flink-runtime"))
    compileOnly(project(":flink-metrics:flink-metrics-core"))
}

description = "flink-metrics-prometheus"
