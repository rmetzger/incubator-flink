dependencies {
    implementation("com.google.cloud:google-cloud-pubsub:1.62.0")
    testImplementation(project(":flink-streaming-java"))
    testImplementation(project(":flink-runtime"))
    compileOnly(project(":flink-streaming-java"))
}

description = "flink-connector-gcp-pubsub"
