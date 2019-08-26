dependencies {
    implementation(project(":flink-core"))
    implementation(project(":flink-runtime"))
    implementation(project(":flink-clients"))
    implementation(Libs.flink_shaded_guava)
    implementation(Libs.commons_math3)
    testImplementation(project(":flink-core"))
    testImplementation(project(":flink-test-utils-parent:flink-test-utils-junit"))
    testImplementation(project(":flink-runtime"))
}

description = "flink-streaming-java"
