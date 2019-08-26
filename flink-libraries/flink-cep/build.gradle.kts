dependencies {
    implementation(Libs.flink_shaded_guava)
    testImplementation(project(":flink-core"))
    testImplementation(project(":flink-test-utils-parent:flink-test-utils"))
    testImplementation(project(":flink-streaming-java"))
    testImplementation(project(":flink-runtime"))
    testImplementation(project(":flink-state-backends:flink-statebackend-rocksdb"))
    compileOnly(project(":flink-core"))
    compileOnly(project(":flink-streaming-java"))
}

description = "flink-cep"
