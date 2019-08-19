plugins {
    id("scala")
}

dependencies {
    implementation("org.slf4j:slf4j-api:1.7.15")
    implementation(project(":flink-annotations"))
    implementation(project(":flink-table:flink-table-common"))
    implementation(project(":flink-table:flink-table-api-java"))
    implementation(project(":flink-core"))
    implementation("org.scala-lang:scala-reflect:2.11.12")
    implementation("org.scala-lang:scala-library:2.11.12")
    implementation("org.scala-lang:scala-compiler:2.11.12")
}

description = "flink-table-api-scala"

flinkJointScalaJavaCompilation()
