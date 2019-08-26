dependencies {
    implementation(project(":flink-core"))
    implementation(project(":flink-runtime"))
    implementation(project(":flink-java"))
    implementation(Libs.flink_shaded_guava)
    implementation(Libs.flink_shaded_jackson)
    testImplementation(project(":flink-test-utils-parent:flink-test-utils-junit"))
}

description = "flink-optimizer"
