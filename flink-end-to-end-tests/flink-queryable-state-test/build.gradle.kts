dependencies {
    implementation(project(":flink-core"))
    implementation(project(":flink-java"))
    implementation(project(":flink-queryable-state:flink-queryable-state-client-java"))
    compileOnly(project(":flink-streaming-java"))
    compileOnly(project(":flink-state-backends:flink-statebackend-rocksdb"))
}

description = "flink-queryable-state-test"
