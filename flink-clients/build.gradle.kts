dependencies {
    implementation(project(":flink-core"))
    implementation(project(":flink-runtime"))
    implementation(project(":flink-optimizer"))
    implementation(project(":flink-java"))
    implementation(Libs.commons_cli)
    testImplementation(project(":flink-test-utils-parent:flink-test-utils-junit"))
    testImplementation(project(":flink-runtime"))
}

description = "flink-clients"
