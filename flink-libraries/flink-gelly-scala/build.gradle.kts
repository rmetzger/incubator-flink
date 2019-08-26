dependencies {
    implementation(project(":flink-libraries:flink-gelly"))
    testImplementation(project(":flink-tests"))
    testImplementation(project(":flink-test-utils-parent:flink-test-utils"))
    compileOnly(project(":flink-scala"))
    compileOnly(project(":flink-clients"))
    compileOnly(Libs.scala_reflect)
    compileOnly(Libs.scala_library)
    compileOnly(Libs.scala_compiler)
}

description = "flink-gelly-scala"
