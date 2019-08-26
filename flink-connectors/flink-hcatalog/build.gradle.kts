dependencies {
    implementation(project(":flink-connectors:flink-hadoop-compatibility"))
    implementation(Libs.hcatalog_core)
    compileOnly(project(":flink-java"))
    compileOnly(Libs.scala_library)
    compileOnly(Libs.flink_shaded_hadoop_2)
}

description = "flink-hcatalog"
