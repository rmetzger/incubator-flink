plugins {
    id("scala")
}

dependencies {
    implementation("org.apache.mesos:mesos:1.0.1")
    implementation("com.netflix.fenzo:fenzo-core:0.10.1")
    implementation("org.apache.flink:flink-shaded-netty:4.1.32.Final-7.0")
    testImplementation("org.scalatest:scalatest_${Versions.baseScala}:3.0.0")
    testImplementation("org.apache.curator:curator-test:2.12.0")
    testImplementation("com.typesafe.akka:akka-testkit_${Versions.baseScala}:2.5.21")
    testImplementation(project(":flink-runtime"))
    testImplementation(project(":flink-test-utils-parent:flink-test-utils-junit"))
    testImplementation(project(":flink-test-utils-parent:flink-test-utils"))
    compileOnly(project(":flink-runtime"))
    compileOnly(project(":flink-clients"))
    compileOnly("org.apache.flink:flink-shaded-jackson:2.9.8-7.0")
    compileOnly("com.typesafe.akka:akka-actor_${Versions.baseScala}:2.5.21")
    compileOnly("com.typesafe.akka:akka-remote_${Versions.baseScala}:2.5.21")
    compileOnly("com.typesafe.akka:akka-slf4j_${Versions.baseScala}:2.5.21")
}

description = "flink-mesos"

flinkJointScalaJavaCompilation()
