dependencies {
    implementation(project(":flink-core"))
    implementation(project(":flink-runtime"))
    implementation(project(":flink-clients"))
    implementation("org.apache.flink:flink-shaded-guava:18.0-7.0")
    implementation("org.apache.commons:commons-math3:3.5")
    testImplementation(project(":flink-core"))
    testImplementation(project(":flink-test-utils-parent:flink-test-utils-junit"))
    testImplementation(project(":flink-runtime"))
}

description = "flink-streaming-java"
