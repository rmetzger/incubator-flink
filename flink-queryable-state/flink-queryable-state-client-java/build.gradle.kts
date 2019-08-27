dependencies {
    implementation(Libs.slf4j_api)
    implementation(Libs.flink_shaded_netty)
    implementation(Libs.flink_shaded_guava)
    implementation(project(":flink-annotations"))
    testImplementation(project(path = ":flink-core", configuration = "testArtifacts"))
    testImplementation(project(":flink-test-utils-parent:flink-test-utils-junit"))
    compileOnly(project(":flink-core"))
}

description = "flink-queryable-state-client-java"
