dependencies {
    implementation(project(":flink-metrics:flink-metrics-dropwizard"))
    implementation("io.dropwizard.metrics:metrics-core:3.1.5")
    implementation("io.dropwizard.metrics:metrics-graphite:3.1.5")
    compileOnly(project(":flink-annotations"))
    compileOnly(project(":flink-metrics:flink-metrics-core"))
}

description = "flink-metrics-graphite"
