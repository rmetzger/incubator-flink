dependencies {
    implementation(project(":flink-connectors:flink-hadoop-compatibility"))
    implementation("org.apache.hive.hcatalog:hcatalog-core:0.12.0")
    compileOnly(project(":flink-java"))
    compileOnly("org.scala-lang:scala-library:2.11.12")
    compileOnly("org.apache.flink:flink-shaded-hadoop-2:2.4.1-7.0")
}

description = "flink-hcatalog"
