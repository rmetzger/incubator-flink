plugins {
    id("scala")
}

dependencies {
    implementation(project(":flink-table:flink-table-common"))
    implementation(project(":flink-table:flink-table-api-java"))
    implementation(project(":flink-table:flink-table-api-scala"))
    implementation(project(":flink-table:flink-table-api-java-bridge"))
    implementation(project(":flink-table:flink-table-api-scala-bridge"))
//    implementation(project(":flink-table:flink-sql-parser"))
    implementation(project(":flink-table:flink-table-runtime-blink"))
    implementation("org.codehaus.janino:janino:3.0.9")
    implementation("org.apache.calcite:calcite-core:1.20.0")
    implementation("org.reflections:reflections:0.9.10")
    testImplementation(project(":flink-test-utils-parent:flink-test-utils"))
    testImplementation(project(":flink-table:flink-table-runtime-blink"))
    testImplementation(project(":flink-streaming-java"))
    testImplementation(project(":flink-state-backends:flink-statebackend-rocksdb"))
    compileOnly(project(":flink-scala"))
    compileOnly(project(":flink-streaming-scala"))
    compileOnly(project(":flink-libraries:flink-cep"))
}

description = "flink-table-planner-blink"

flinkJointScalaJavaCompilation()
