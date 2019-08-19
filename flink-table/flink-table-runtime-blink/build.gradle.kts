dependencies {
    implementation(project(":flink-table:flink-table-common"))
    implementation(project(":flink-table:flink-table-api-java"))
    implementation("org.codehaus.janino:janino:3.0.9")
    implementation("org.apache.calcite.avatica:avatica-core:1.15.0")
    implementation("org.lz4:lz4-java:1.5.0")
    testImplementation(project(":flink-core"))
    testImplementation(project(":flink-test-utils-parent:flink-test-utils"))
    testImplementation(project(":flink-streaming-java"))
    compileOnly(project(":flink-streaming-java"))
    compileOnly(project(":flink-libraries:flink-cep"))
}

description = "flink-table-runtime-blink"
