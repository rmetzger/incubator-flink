plugins {
    id("scala")
}

dependencies {
    implementation(project(":flink-streaming-java"))
    implementation(project(":flink-scala"))
    implementation("org.scala-lang:scala-reflect:2.11.12")
    implementation("org.scala-lang:scala-library:2.11.12")
    implementation("org.scala-lang:scala-r:2.11.12")
    testImplementation("org.scalatest:scalatest:3.0.0")
    testImplementation(project(":flink-test-utils-parent:flink-test-utils-junit"))
    testImplementation(project(":flink-test-utils-parent:flink-test-utils"))
    testImplementation(project(":flink-streaming-java"))
    testImplementation(project(":flink-tests"))
    testImplementation(project(":flink-runtime"))
}

description = "flink-streaming-scala"

flinkJointScalaJavaCompilation()
