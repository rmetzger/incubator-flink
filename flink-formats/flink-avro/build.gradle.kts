dependencies {
    implementation("com.google.code.findbugs:jsr305:1.3.9")
    implementation("org.apache.avro:avro:1.8.2")
    implementation("com.esotericsoftware.kryo:kryo:2.24.0")
    implementation(project(":flink-annotations"))
    testImplementation(project(":flink-table:flink-table-common"))
    testImplementation(project(":flink-table:flink-table-api-java-bridge"))
    testImplementation(project(":flink-table:flink-table-planner"))
    testImplementation(project(":flink-table:flink-table-planner"))
    testImplementation(project(":flink-streaming-scala"))
    testImplementation(project(":flink-test-utils-parent:flink-test-utils"))
    testImplementation(project(":flink-core"))
    testImplementation(project(":flink-runtime"))
    compileOnly(project(":flink-core"))
    compileOnly(project(":flink-table:flink-table-common"))
    compileOnly("joda-time:joda-time:2.5")
}

description = "flink-avro"
