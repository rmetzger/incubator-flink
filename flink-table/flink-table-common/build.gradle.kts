dependencies {
    implementation(Libs.slf4j_api)
    implementation(Libs.jsr305)
    implementation(project(":flink-core"))
    implementation(project(":flink-annotations"))
    implementation(project(":flink-metrics:flink-metrics-core"))
    testImplementation(Libs.junit)
    testImplementation(Libs.kryo)
}

description = "flink-table-common"

flinkCreateTestJar()
