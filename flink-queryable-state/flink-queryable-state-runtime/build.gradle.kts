dependencies {
    testImplementation(project(":flink-state-backends:flink-statebackend-rocksdb"))
    testImplementation(project(":flink-test-utils-parent:flink-test-utils"))
    testImplementation(Libs.curator_test)
    testImplementation(project(":flink-runtime"))
    compileOnly(project(":flink-core"))
    compileOnly(project(":flink-runtime"))
    compileOnly(project(":flink-queryable-state:flink-queryable-state-client-java"))
}

description = "flink-queryable-state-runtime"
