dependencies {
    testImplementation(project(":flink-test-utils-parent:flink-test-utils"))
    testImplementation(project(":flink-core"))
    testImplementation(project(":flink-optimizer"))
    compileOnly(project(":flink-java"))
    compileOnly(project(":flink-clients"))
    compileOnly("org.apache.commons:commons-lang3:3.3.2")
}

description = "flink-gelly"
