dependencies {
    implementation("com.datastax.cassandra:cassandra-driver-core:3.0.0")
    implementation("com.datastax.cassandra:cassandra-driver-mapping:3.0.0")
    implementation("com.google.guava:guava:18.0")
    testImplementation(project(":flink-runtime"))
    testImplementation(project(":flink-streaming-java"))
    testImplementation(project(":flink-tests"))
    testImplementation(project(":flink-test-utils-parent:flink-test-utils"))
    testImplementation("org.apache.cassandra:cassandra-all:2.2.5")
    compileOnly(project(":flink-streaming-java"))
    compileOnly(project(":flink-streaming-scala"))
    compileOnly(project(":flink-table:flink-table-api-java-bridge"))
    compileOnly(project(":flink-table:flink-table-planner"))
    compileOnly("org.scala-lang:scala-library:2.11.12")
}

description = "flink-connector-cassandra"
