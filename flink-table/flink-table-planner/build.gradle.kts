plugins {
    scala
}

dependencies {
    implementation(project(":flink-table:flink-table-common"))
    implementation(project(":flink-table:flink-table-api-java-bridge"))
    implementation(project(":flink-table:flink-table-api-scala-bridge"))
    implementation(project(":flink-table:flink-sql-parser"))
    implementation(Libs.scala_library)
    implementation(Libs.janino)
    implementation(Libs.calcite_core)
    implementation(Libs.joda_time)
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
    compileOnly(Libs.flink_shaded_jackson)
}

description = "flink-table-planner"

flinkJointScalaJavaCompilation()
