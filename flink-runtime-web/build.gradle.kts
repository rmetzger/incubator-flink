dependencies {
    implementation(project(":flink-runtime"))
    implementation(project(":flink-clients"))
    implementation("org.apache.flink:flink-shaded-netty:4.1.32.Final-7.0")
    implementation("org.apache.flink:flink-shaded-guava:18.0-7.0")
    implementation("org.apache.flink:flink-shaded-jackson:2.9.8-7.0")
    implementation("org.javassist:javassist:3.24.0-GA")
    testImplementation(project(":flink-test-utils-parent:flink-test-utils-junit"))
    testImplementation(project(":flink-test-utils-parent:flink-test-utils"))
    testImplementation("org.apache.curator:curator-test:2.12.0")
    testImplementation(project(":flink-runtime"))
    testImplementation("org.apache.flink:flink-shaded-jackson-module-jsonSchema:2.9.8-7.0")
}

description = "flink-runtime-web"
