plugins {
    java
}

repositories {
    mavenCentral()
}

dependencies {
    implementation("org.slf4j:slf4j-api:1.7.15")
    implementation("com.google.code.findbugs:jsr305:1.3.9")

    testImplementation("junit:junit:4.12")
    testImplementation(project(":flink-test-utils-parent:flink-test-utils-junit"))
}
