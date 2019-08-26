dependencies {
    implementation(Libs.scopt)
    implementation(project(":flink-clients"))
    implementation(project(":flink-scala"))
    implementation(project(":flink-streaming-scala"))
    implementation(Libs.scala_r)
    implementation(Libs.scala_library)
    implementation(Libs.scala_reflect)
    testImplementation(project(":flink-test-utils-parent:flink-test-utils"))
    compileOnly(project(":flink-table:flink-table-api-scala-bridge"))
//    compileOnly(project(":flink-table:flink-table-planner"))
}

description = "flink-scala-shell"
