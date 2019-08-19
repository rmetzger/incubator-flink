dependencies {
    implementation(project(":flink-examples:flink-examples-batch"))
    compileOnly(project(":flink-core"))
    compileOnly(project(":flink-java"))
}

description = "flink-high-parallelism-iterations-test"
