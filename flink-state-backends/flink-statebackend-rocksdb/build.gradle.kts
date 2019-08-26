dependencies {
    implementation(Libs.frocksdbjni)
    testImplementation(project(":flink-test-utils-parent:flink-test-utils-junit"))
    testImplementation(project(":flink-core"))
    testImplementation(project(":flink-streaming-java"))
    testImplementation(project(":flink-runtime"))
    compileOnly(project(":flink-streaming-java"))
    compileOnly(project(":flink-clients"))
}

description = "flink-statebackend-rocksdb"
