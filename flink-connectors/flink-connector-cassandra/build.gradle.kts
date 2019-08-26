dependencies {
    implementation(Libs.cassandra_driver_core)
    implementation(Libs.cassandra_driver_mapping)
    implementation(Libs.guava)
    testImplementation(project(":flink-runtime"))
    testImplementation(project(":flink-streaming-java"))
    testImplementation(project(":flink-tests"))
    testImplementation(project(":flink-test-utils-parent:flink-test-utils"))
    testImplementation(Libs.cassandra_all)
    compileOnly(project(":flink-streaming-java"))
    compileOnly(project(":flink-streaming-scala"))
    compileOnly(project(":flink-table:flink-table-api-java-bridge"))
    compileOnly(project(":flink-table:flink-table-planner"))
    compileOnly(Libs.scala_library)
}

description = "flink-connector-cassandra"
