dependencies {
    testImplementation(project(":flink-test-utils-parent:flink-test-utils"))
    testImplementation(project(":flink-core"))
    testImplementation(project(":flink-optimizer"))
    compileOnly(project(":flink-java"))
    compileOnly(project(":flink-clients"))
    compileOnly(Libs.commons_lang3)
}

description = "flink-gelly"
