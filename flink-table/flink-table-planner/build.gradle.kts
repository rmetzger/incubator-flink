plugins {
    id("scala")
}

dependencies {
    implementation(project(":flink-table:flink-table-common"))
    implementation(project(":flink-table:flink-table-api-java-bridge"))
    implementation(project(":flink-table:flink-table-api-scala-bridge"))
    implementation(project(":flink-table:flink-sql-parser"))
    implementation("org.codehaus.janino:janino:3.0.9")
    implementation("org.apache.calcite:calcite-core:1.20.0")
    implementation("joda-time:joda-time:2.5")
    testImplementation(project(":flink-table:flink-table-common"))
    testImplementation(project(":flink-test-utils-parent:flink-test-utils"))
    testImplementation(project(":flink-tests"))
    testImplementation(project(":flink-core"))
    testImplementation(project(":flink-state-backends:flink-statebackend-rocksdb"))
    testImplementation(project(":flink-streaming-java"))
    testImplementation(project(":flink-runtime"))
    compileOnly(project(":flink-scala"))
    compileOnly(project(":flink-streaming-scala"))
    compileOnly(project(":flink-libraries:flink-cep"))
    compileOnly("org.apache.flink:flink-shaded-jackson:2.9.8-7.0")
}

description = "flink-table-planner"

flinkJointScalaJavaCompilation()
