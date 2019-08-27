description = "flink-runtime"

plugins {
    scala
}

dependencies {
    implementation(project(":flink-core"))
    implementation(project(":flink-java"))
    implementation(project(":flink-queryable-state:flink-queryable-state-client-java"))
    implementation(project(":flink-filesystems:flink-hadoop-fs"))
    implementation(Libs.flink_shaded_hadoop_2)
    implementation(Libs.commons_io)
    implementation(Libs.flink_shaded_netty)
    implementation(Libs.flink_shaded_guava)
    implementation(Libs.flink_shaded_asm_6)
    implementation(Libs.flink_shaded_jackson)
    implementation(Libs.commons_lang3)
    implementation(Libs.commons_cli)
    implementation(Libs.javassist)
    implementation(Libs.scala_library)
    implementation(Libs.akka_actor_2_11)
    implementation(Libs.akka_remote_2_11)
    implementation(Libs.akka_stream_2_11)
    implementation(Libs.akka_protobuf_2_11)
    implementation(Libs.akka_slf4j_2_11)
    implementation(Libs.grizzled_slf4j_2_11)
    implementation(Libs.scopt_2_11)
    implementation(Libs.snappy_java)
    implementation(Libs.chill_2_11)
    implementation(Libs.zookeeper)
    implementation(project(":flink-shaded-curator"))
    implementation(Libs.oshi_core)
    api(project(":flink-metrics:flink-metrics-core"))
    testImplementation(project(":flink-test-utils-parent:flink-test-utils-junit"))
    testImplementation(project(path = ":flink-metrics:flink-metrics-core", configuration = "testArtifacts"))
    testImplementation(project(path = ":flink-core", configuration = "testArtifacts"))
    testImplementation(Libs.flink_shaded_netty_tcnative_dynamic)
    testImplementation(Libs.curator_test)
    testImplementation(Libs.scalatest_2_11)
    testImplementation(Libs.okhttp)
    testImplementation(Libs.akka_testkit_2_11)
    testImplementation(Libs.reflections)
    testImplementation(Libs.jcip_annotations)
}

tasks.withType<Test> {
    maxHeapSize = "1024m"
}

flinkJointScalaJavaCompilation()
flinkCreateTestJar()
