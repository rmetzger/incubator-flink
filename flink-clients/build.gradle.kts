dependencies {
    implementation(project(":flink-core"))
    implementation(project(":flink-runtime"))
    implementation(project(":flink-optimizer"))
    implementation(project(":flink-java"))
    implementation("commons-cli:commons-cli:1.3.1")
    testImplementation(project(":flink-test-utils-parent:flink-test-utils-junit"))
    testImplementation(project(":flink-runtime"))
}

description = "flink-clients"
