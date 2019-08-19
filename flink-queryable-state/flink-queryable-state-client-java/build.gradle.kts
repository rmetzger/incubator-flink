dependencies {
    implementation("org.slf4j:slf4j-api:1.7.15")
    implementation("org.apache.flink:flink-shaded-netty:4.1.32.Final-7.0")
    implementation("org.apache.flink:flink-shaded-guava:18.0-7.0")
    implementation(project(":flink-annotations"))
    testImplementation(project(path = ":flink-core", configuration = "testArtifacts"))
    compileOnly(project(":flink-core"))
}

description = "flink-queryable-state-client-java"
