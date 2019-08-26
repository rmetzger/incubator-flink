plugins {
    `java-library`
    scala
}

dependencies {
    implementation(Libs.slf4j_api)
    implementation(project(":flink-annotations"))
    implementation(project(":flink-table:flink-table-common"))
    implementation(project(":flink-table:flink-table-api-java"))
    implementation(project(":flink-core"))
    implementation(Libs.scala_reflect)
    api(Libs.scala_library)
    implementation(Libs.scala_compiler)
}

description = "flink-table-api-scala"

flinkJointScalaJavaCompilation()
