dependencies {
    implementation(project(":flink-table:flink-table-common"))
    implementation(project(":flink-table:flink-table-api-java"))
    implementation(Libs.janino)
    implementation(Libs.avatica_core)
    implementation(Libs.lz4_java)
    testImplementation(project(":flink-core"))
    testImplementation(project(":flink-test-utils-parent:flink-test-utils"))
    testImplementation(project(":flink-streaming-java"))
    compileOnly(project(":flink-streaming-java"))
    compileOnly(project(":flink-libraries:flink-cep"))
}

description = "flink-table-runtime-blink"
