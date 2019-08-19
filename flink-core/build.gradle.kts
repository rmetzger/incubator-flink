dependencies {
    implementation("org.slf4j:slf4j-api:1.7.15")
    implementation("com.google.code.findbugs:jsr305:1.3.9")
    implementation(project(":flink-annotations"))
    implementation(project(":flink-metrics:flink-metrics-core"))
    implementation("org.apache.flink:flink-shaded-asm-6:6.2.1-7.0")
    implementation("org.apache.commons:commons-lang3:3.3.2")
    implementation("com.esotericsoftware.kryo:kryo:2.24.0")
    implementation("commons-collections:commons-collections:3.2.2")
    implementation("org.apache.commons:commons-compress:1.18")
    implementation("org.apache.flink:flink-shaded-guava:18.0-7.0")
    testImplementation(project(":flink-test-utils-parent:flink-test-utils-junit"))
    testImplementation("commons-io:commons-io:2.4")
    testImplementation("joda-time:joda-time:2.5")
    testImplementation("org.joda:joda-convert:1.7")
    testImplementation("org.apache.flink:flink-shaded-jackson:2.9.8-7.0")
    testImplementation("org.projectlombok:lombok:1.16.22")
    testImplementation("junit:junit:4.12")
    testImplementation("org.mockito:mockito-core:2.21.0")
    testImplementation("org.powermock:powermock-module-junit4:2.0.2")
    testImplementation("org.powermock:powermock-api-mockito2:2.0.2")
    testImplementation("org.hamcrest:hamcrest-all:1.3")
}

description = "flink-core"

flinkCreateTestJar()
