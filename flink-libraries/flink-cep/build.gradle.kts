dependencies {
    implementation("org.apache.flink:flink-shaded-guava:18.0-7.0")
    testImplementation(project(":flink-core"))
    testImplementation(project(":flink-test-utils-parent:flink-test-utils"))
    testImplementation(project(":flink-streaming-java"))
    testImplementation(project(":flink-runtime"))
    testImplementation(project(":flink-state-backends:flink-statebackend-rocksdb"))
    compileOnly(project(":flink-core"))
    compileOnly(project(":flink-streaming-java"))
}

description = "flink-cep"
