dependencies {
    implementation(Libs.slf4j_api)
    implementation(Libs.flink_shaded_netty)
    implementation(Libs.flink_shaded_guava)
    implementation(project(":flink-annotations"))
    testImplementation(project(path = ":flink-core", configuration = "testArtifacts"))
    compileOnly(project(":flink-core"))
}

description = "flink-queryable-state-client-java"
