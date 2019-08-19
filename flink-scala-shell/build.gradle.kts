dependencies {
    implementation("com.github.scopt:scopt:3.5.0")
    implementation(project(":flink-clients"))
    implementation(project(":flink-scala"))
    implementation(project(":flink-streaming-scala"))
    implementation("org.scala-lang:scala-r:2.11.12")
    implementation("org.scala-lang:scala-library:2.11.12")
    implementation("org.scala-lang:scala-reflect:2.11.12")
    testImplementation(project(":flink-test-utils-parent:flink-test-utils"))
    compileOnly(project(":flink-table:flink-table-api-scala-bridge"))
//    compileOnly(project(":flink-table:flink-table-planner"))
}

description = "flink-scala-shell"
