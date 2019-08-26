dependencies {
    compileOnly(Libs.flink_shaded_jackson)
    compileOnly(project(":flink-core"))
    implementation(project(":flink-annotations"))
    compileOnly(project(":flink-table:flink-table-common"))
    testImplementation(project(path = ":flink-table:flink-table-common", configuration = "testArtifacts"))
    testImplementation(project(":flink-test-utils-parent:flink-test-utils-junit"))
}

description = "flink-csv"
