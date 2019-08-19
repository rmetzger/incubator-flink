dependencies {
    implementation(project(":flink-formats:flink-avro"))
    testImplementation(project(":flink-test-utils-parent:flink-test-utils"))
    testImplementation(project(":flink-connectors:flink-hadoop-compatibility"))
    testImplementation(project(":flink-streaming-java"))
    testImplementation(project(":flink-core"))
    testImplementation(project(":flink-tests"))
    testImplementation(project(":flink-runtime"))
    testImplementation("org.apache.hadoop:hadoop-hdfs:2.4.1")
    testImplementation("org.apache.hadoop:hadoop-common:2.4.1")
    testImplementation("org.apache.hadoop:hadoop-minikdc:2.7.2")
    compileOnly(project(":flink-streaming-java"))
    compileOnly("org.apache.flink:flink-shaded-hadoop-2:2.4.1-7.0")
}

description = "flink-connector-filesystem"
