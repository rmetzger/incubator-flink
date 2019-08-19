dependencies {
    implementation(project(":flink-libraries:flink-gelly"))
    testImplementation(project(":flink-tests"))
    testImplementation(project(":flink-test-utils-parent:flink-test-utils"))
    compileOnly(project(":flink-scala"))
    compileOnly(project(":flink-clients"))
    compileOnly("org.scala-lang:scala-reflect:2.11.12")
    compileOnly("org.scala-lang:scala-library:2.11.12")
    compileOnly("org.scala-lang:scala-compiler:2.11.12")
}

description = "flink-gelly-scala"
