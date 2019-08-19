dependencies {
    implementation(project(":flink-libraries:flink-cep"))
    testImplementation(project(":flink-test-utils-parent:flink-test-utils"))
    testImplementation(project(":flink-tests"))
    testImplementation(project(":flink-streaming-scala"))
    testImplementation(project(":flink-libraries:flink-cep"))
    compileOnly(project(":flink-streaming-scala"))
    compileOnly("org.scala-lang:scala-reflect:2.11.12")
    compileOnly("org.scala-lang:scala-library:2.11.12")
    compileOnly("org.scala-lang:scala-compiler:2.11.12")
}

description = "flink-cep-scala"
