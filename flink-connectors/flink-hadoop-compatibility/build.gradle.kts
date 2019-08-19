dependencies {
    testImplementation(project(":flink-java"))
    testImplementation(project(":flink-test-utils-parent:flink-test-utils"))
    testImplementation(project(":flink-core"))
    compileOnly(project(":flink-java"))
    compileOnly(project(":flink-scala"))
    compileOnly("org.apache.flink:flink-shaded-hadoop-2:2.4.1-7.0")
}

description = "flink-hadoop-compatibility"
