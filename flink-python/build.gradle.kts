dependencies {
    implementation(Libs.py4j)
    implementation(Libs.pyrolite)
    compileOnly(project(":flink-core"))
    compileOnly(project(":flink-java"))
    compileOnly(project(":flink-streaming-java"))
    compileOnly(project(":flink-table:flink-table-common"))
}

description = "flink-python"
