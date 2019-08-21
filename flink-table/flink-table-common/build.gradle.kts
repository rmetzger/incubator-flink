dependencies {
    implementation("org.slf4j:slf4j-api:1.7.15")
    implementation("com.google.code.findbugs:jsr305:1.3.9")
    implementation(project(":flink-core"))
    implementation(project(":flink-annotations"))
    implementation(project(":flink-metrics:flink-metrics-core"))
    testImplementation(Libs.junit)
    testImplementation("com.esotericsoftware.kryo:kryo:2.24.0")
}

description = "flink-table-common"

flinkCreateTestJar()
