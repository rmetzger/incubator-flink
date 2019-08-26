dependencies {
    implementation(Libs.amqp_client)
    testImplementation(project(":flink-streaming-java"))
    testImplementation(project(":flink-runtime"))
    compileOnly(project(":flink-streaming-java"))
}

description = "flink-connector-rabbitmq"
