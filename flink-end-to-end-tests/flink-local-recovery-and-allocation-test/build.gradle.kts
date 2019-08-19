dependencies {
    compileOnly(project(":flink-streaming-java"))
    compileOnly(project(":flink-state-backends:flink-statebackend-rocksdb"))
}

description = "flink-local-recovery-and-allocation-test"
