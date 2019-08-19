dependencies {
    implementation(project(":flink-java"))
    implementation(project(":flink-clients"))
    implementation(project(":flink-scala"))
    implementation(project(":flink-libraries:flink-gelly"))
    implementation(project(":flink-libraries:flink-gelly-scala"))
    implementation("org.apache.flink:flink-shaded-jackson:2.9.8-7.0")
    testImplementation(project(":flink-test-utils-parent:flink-test-utils"))
    testImplementation(project(":flink-tests"))
    testImplementation(project(":flink-core"))
}

description = "flink-gelly-examples"
