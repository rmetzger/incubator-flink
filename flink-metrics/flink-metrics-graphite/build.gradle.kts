dependencies {
    implementation(project(":flink-metrics:flink-metrics-dropwizard"))
    implementation(Libs.metrics_core)
    implementation(Libs.metrics_graphite)
    compileOnly(project(":flink-annotations"))
    compileOnly(project(":flink-metrics:flink-metrics-core"))
}

description = "flink-metrics-graphite"
