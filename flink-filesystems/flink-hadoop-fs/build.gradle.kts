dependencies {
    implementation("com.google.code.findbugs:jsr305:1.3.9")
    implementation("org.slf4j:slf4j-api:1.7.15")
    implementation(project(":flink-core"))
    implementation(project(":flink-annotations"))
    implementation("org.apache.flink:flink-shaded-hadoop-2:2.4.1-7.0")
    implementation("org.apache.commons:commons-lang3:3.3.2")
    testImplementation("org.apache.hadoop:hadoop-hdfs:2.4.1:tests")
    testImplementation("org.apache.hadoop:hadoop-common:2.4.1:tests")
    testImplementation(project(path = ":flink-core", configuration = "testArtifacts"))
    testImplementation(project(":flink-test-utils-parent:flink-test-utils-junit"))
}

description = "flink-hadoop-fs"

flinkCreateTestJar()
