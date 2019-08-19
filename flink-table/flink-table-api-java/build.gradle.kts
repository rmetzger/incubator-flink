dependencies {
    implementation("com.google.code.findbugs:jsr305:1.3.9")
    implementation("org.slf4j:slf4j-api:1.7.15")
    implementation(project(":flink-table:flink-table-common"))
    implementation(project(":flink-annotations"))
    implementation(project(":flink-core"))
    testImplementation(project(":flink-table:flink-table-common"))
    testImplementation(project(":flink-test-utils-parent:flink-test-utils-junit"))
}

description = "flink-table-api-java"
