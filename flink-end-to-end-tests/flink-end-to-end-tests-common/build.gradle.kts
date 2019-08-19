dependencies {
    implementation(project(":flink-core"))
    implementation("com.squareup.okhttp3:okhttp:3.7.0")
    implementation("org.apache.flink:flink-shaded-jackson:2.9.8-7.0")
    implementation(project(":flink-test-utils-parent:flink-test-utils-junit"))
    compileOnly(project(":flink-dist"))
}
