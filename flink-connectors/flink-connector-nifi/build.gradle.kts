dependencies {
    implementation(Libs.nifi_site_to_site_client)
    testImplementation(project(":flink-streaming-java"))
    testImplementation(project(":flink-tests"))
    testImplementation(project(":flink-test-utils-parent:flink-test-utils"))
    compileOnly(project(":flink-streaming-java"))
}

description = "flink-connector-nifi"
