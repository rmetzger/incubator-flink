dependencies {
    implementation(Libs.jsr305)
    implementation(Libs.slf4j_api)
    implementation(project(":flink-core"))
    implementation(project(":flink-annotations"))
    implementation(Libs.flink_shaded_hadoop_2)
    implementation(Libs.commons_lang3)
    testImplementation("${Libs.hadoop_hdfs}:tests")
    testImplementation("${Libs.hadoop_common}:tests")
    testImplementation(project(path = ":flink-core", configuration = "testArtifacts"))
    testImplementation(project(":flink-test-utils-parent:flink-test-utils-junit"))
}

description = "flink-hadoop-fs"

flinkCreateTestJar()
