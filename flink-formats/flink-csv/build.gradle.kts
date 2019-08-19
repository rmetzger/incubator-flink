dependencies {
    compileOnly("org.apache.flink:flink-shaded-jackson:2.9.8-7.0")
    compileOnly(project(":flink-core"))
    implementation(project(":flink-annotations"))
    compileOnly(project(":flink-table:flink-table-common"))
    testImplementation(project(path = ":flink-table:flink-table-common", configuration = "testArtifacts"))
    testImplementation(project(":flink-test-utils-parent:flink-test-utils-junit"))
}

description = "flink-csv"
