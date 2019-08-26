dependencies {
    implementation(project(":flink-annotations"))
    testImplementation(project(":flink-table:flink-table-common"))
    testImplementation(project(":flink-table:flink-table-planner"))
    testImplementation(Libs.scala_compiler)
    compileOnly(Libs.flink_shaded_jackson)
    compileOnly(project(":flink-core"))
    compileOnly(project(":flink-table:flink-table-common"))
}

description = "flink-json"
