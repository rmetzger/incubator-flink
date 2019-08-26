plugins {
    scala
}

dependencies {
    implementation(project(":flink-table:flink-table-api-scala"))
    implementation(project(":flink-scala"))
    implementation(project(":flink-streaming-scala"))
}

description = "flink-table-api-scala-bridge"

flinkJointScalaJavaCompilation()
