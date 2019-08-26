dependencies {
    implementation(Libs.jsr305)
    implementation(Libs.avro)
    implementation(Libs.kryo)
    implementation(project(":flink-annotations"))
    testImplementation(project(":flink-table:flink-table-common"))
    testImplementation(project(":flink-table:flink-table-api-java-bridge"))
    testImplementation(project(":flink-table:flink-table-planner"))
    testImplementation(project(":flink-table:flink-table-planner"))
    testImplementation(project(":flink-streaming-scala"))
    testImplementation(project(":flink-test-utils-parent:flink-test-utils"))
    testImplementation(project(":flink-core"))
    testImplementation(project(":flink-runtime"))
    compileOnly(project(":flink-core"))
    compileOnly(project(":flink-table:flink-table-common"))
    compileOnly(Libs.joda_time)
}

description = "flink-avro"
