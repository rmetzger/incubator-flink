plugins {
    id("java-library")
}

dependencies {
    implementation(Libs.jsr305)
    api(Libs.kryo)
    implementation(Libs.slf4j_api)
    implementation(project(":flink-core"))
    implementation(project(":flink-annotations"))
    implementation(Libs.flink_shaded_asm_6)
    implementation(Libs.commons_lang3)
    implementation(Libs.commons_math3)
    testImplementation(project(":flink-test-utils-parent:flink-test-utils-junit"))
    testImplementation(Libs.junit)
    testImplementation(Libs.hamcrest_all)
    testImplementation(project(":flink-metrics:flink-metrics-core"))
}

description = "flink-java"
