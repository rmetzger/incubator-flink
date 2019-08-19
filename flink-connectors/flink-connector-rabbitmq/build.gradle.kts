dependencies {
    implementation("com.rabbitmq:amqp-client:4.2.0")
    testImplementation(project(":flink-streaming-java"))
    testImplementation(project(":flink-runtime"))
    compileOnly(project(":flink-streaming-java"))
}

description = "flink-connector-rabbitmq"
