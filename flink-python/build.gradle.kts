dependencies {
    implementation("net.sf.py4j:py4j:0.10.8.1")
    implementation("net.razorvine:pyrolite:4.13")
    compileOnly(project(":flink-core"))
    compileOnly(project(":flink-java"))
    compileOnly(project(":flink-streaming-java"))
    compileOnly(project(":flink-table:flink-table-common"))
}

description = "flink-python"
