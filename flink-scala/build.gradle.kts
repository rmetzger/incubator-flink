plugins {
    id("scala")
}

dependencies {
    implementation(Libs.slf4j_api)
    implementation(Libs.commons_lang3)
    implementation(project(":flink-core"))
    implementation(project(":flink-java"))
    implementation(project(":flink-annotations"))
    implementation(project(":flink-metrics:flink-metrics-core"))
    implementation(Libs.flink_shaded_asm_6)
    implementation(Libs.flink_shaded_guava)
    implementation(Libs.scala_reflect)
    implementation(Libs.scala_library)
    implementation(Libs.scala_compiler)
    testImplementation(Libs.scalatest_2_11)
    testImplementation(project(":flink-test-utils-parent:flink-test-utils-junit"))
    testImplementation(Libs.chill_2_11)
    testImplementation(project(":flink-runtime"))
    testImplementation(project(":flink-core"))
    testImplementation(Libs.joda_time)
    testImplementation(Libs.joda_convert)
}

description = "flink-scala"

flinkJointScalaJavaCompilation()
