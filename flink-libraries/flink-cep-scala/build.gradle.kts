dependencies {
    implementation(project(":flink-libraries:flink-cep"))
    testImplementation(project(":flink-test-utils-parent:flink-test-utils"))
    testImplementation(project(":flink-tests"))
    testImplementation(project(":flink-streaming-scala"))
    testImplementation(project(":flink-libraries:flink-cep"))
    compileOnly(project(":flink-streaming-scala"))
    compileOnly(Libs.scala_reflect)
    compileOnly(Libs.scala_library)
    compileOnly(Libs.scala_compiler)
}

description = "flink-cep-scala"
