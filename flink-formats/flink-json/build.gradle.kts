dependencies {
    implementation(project(":flink-annotations"))
    testImplementation(project(":flink-table:flink-table-common"))
    testImplementation(project(":flink-table:flink-table-planner"))
    testImplementation("org.scala-lang:scala-compiler:2.11.12")
    compileOnly("org.apache.flink:flink-shaded-jackson:2.9.8-7.0")
    compileOnly(project(":flink-core"))
    compileOnly(project(":flink-table:flink-table-common"))
}

description = "flink-json"
