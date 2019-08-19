dependencies {
    implementation("org.apache.nifi:nifi-site-to-site-client:1.6.0")
    testImplementation(project(":flink-streaming-java"))
    testImplementation(project(":flink-tests"))
    testImplementation(project(":flink-test-utils-parent:flink-test-utils"))
    compileOnly(project(":flink-streaming-java"))
}

description = "flink-connector-nifi"
