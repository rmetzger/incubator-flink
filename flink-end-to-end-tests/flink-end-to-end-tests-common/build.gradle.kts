dependencies {
    implementation(project(":flink-core"))
    implementation(Libs.okhttp)
    implementation(Libs.flink_shaded_jackson)
    implementation(project(":flink-test-utils-parent:flink-test-utils-junit"))
    compileOnly(project(":flink-dist"))
}
