dependencies {
    implementation("com.data-artisans:frocksdbjni:5.17.2-artisans-1.0")
    testImplementation(project(":flink-test-utils-parent:flink-test-utils-junit"))
    testImplementation(project(":flink-core"))
    testImplementation(project(":flink-streaming-java"))
    testImplementation(project(":flink-runtime"))
    compileOnly(project(":flink-streaming-java"))
    compileOnly(project(":flink-clients"))
}

description = "flink-statebackend-rocksdb"
