dependencies {
    implementation(project(":flink-connectors:flink-connector-elasticsearch-base"))
    implementation("org.elasticsearch.client:transport:5.1.2")
    implementation("org.apache.logging.log4j:log4j-to-slf4j:2.7")
    implementation("org.apache.logging.log4j:log4j-:2.7")
    testImplementation(project(":flink-test-utils-parent:flink-test-utils"))
    testImplementation(project(":flink-streaming-java"))
    testImplementation(project(":flink-connectors:flink-connector-elasticsearch-base"))
    testImplementation("org.apache.logging.log4j:log4j-core:2.7")
    compileOnly(project(":flink-streaming-java"))
}

description = "flink-connector-elasticsearch5"
