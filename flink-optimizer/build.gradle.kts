dependencies {
    implementation(project(":flink-core"))
    implementation(project(":flink-runtime"))
    implementation(project(":flink-java"))
    implementation("org.apache.flink:flink-shaded-guava:18.0-7.0")
    implementation("org.apache.flink:flink-shaded-jackson:2.9.8-7.0")
    testImplementation(project(":flink-test-utils-parent:flink-test-utils-junit"))
}

description = "flink-optimizer"
