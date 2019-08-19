plugins {
    id("scala")
}

dependencies {
    implementation("org.slf4j:slf4j-api:1.7.15")
    implementation("org.apache.commons:commons-lang3:3.3.2")
    implementation(project(":flink-core"))
    implementation(project(":flink-java"))
    implementation(project(":flink-annotations"))
    implementation(project(":flink-metrics:flink-metrics-core"))
    implementation("org.apache.flink:flink-shaded-asm-6:6.2.1-7.0")
    implementation("org.apache.flink:flink-shaded-guava:18.0-7.0")
    implementation("org.scala-lang:scala-reflect:2.11.12")
    implementation("org.scala-lang:scala-library:2.11.12")
    implementation("org.scala-lang:scala-compiler:2.11.12")
    testImplementation("org.scalatest:scalatest${Versions.baseScala}:3.0.0")
    testImplementation(project(":flink-test-utils-parent:flink-test-utils-junit"))
    testImplementation("com.twitter:chill${Versions.baseScala}:0.7.6")
    testImplementation(project(":flink-runtime"))
    testImplementation(project(":flink-core"))
    testImplementation("joda-time:joda-time:2.5")
    testImplementation("org.joda:joda-convert:1.7")
}

description = "flink-scala"

flinkJointScalaJavaCompilation()
