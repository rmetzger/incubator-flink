plugins {
    id("scala")
}

dependencies {
    implementation(project(":flink-streaming-java"))
    implementation(project(":flink-scala"))
    implementation(Libs.scala_reflect)
    implementation(Libs.scala_library)
    testImplementation(Libs.scalatest_2_11)
    testImplementation(project(":flink-test-utils-parent:flink-test-utils-junit"))
    testImplementation(project(":flink-test-utils-parent:flink-test-utils"))
    testImplementation(project(":flink-streaming-java"))
    testImplementation(project(":flink-tests"))
    testImplementation(project(":flink-runtime"))
}

description = "flink-streaming-scala"

flinkJointScalaJavaCompilation()
