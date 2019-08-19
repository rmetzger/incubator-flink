plugins {
    id("java-library")
}

dependencies {
    implementation("com.google.code.findbugs:jsr305:1.3.9")
    api("com.esotericsoftware.kryo:kryo:2.24.0")
    implementation("org.slf4j:slf4j-api:1.7.15")
    implementation(project(":flink-core"))
    implementation(project(":flink-annotations"))
    implementation(project(":flink-metrics:flink-metrics-core"))
    implementation("org.apache.flink:flink-shaded-asm-6:6.2.1-7.0")
    implementation("org.apache.commons:commons-lang3:3.3.2")
    implementation("org.apache.commons:commons-math3:3.5")
    testImplementation(project(":flink-test-utils-parent:flink-test-utils-junit"))
    testImplementation("junit:junit:4.12")
    testImplementation("org.hamcrest:hamcrest-all:1.3")
}

description = "flink-java"
