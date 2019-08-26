dependencies {
    implementation(Libs.google_cloud_pubsub)
    testImplementation(project(":flink-streaming-java"))
    testImplementation(project(":flink-runtime"))
    compileOnly(project(":flink-streaming-java"))
}

description = "flink-connector-gcp-pubsub"
