dependencies {
    implementation(project(":flink-table:flink-table-common"))
//    implementation(project(":flink-table:flink-sql-parser"))
    implementation(project(":flink-table:flink-table-api-java"))
    implementation(project(":flink-table:flink-table-api-scala"))
    implementation(project(":flink-table:flink-table-api-java-bridge"))
    implementation(project(":flink-table:flink-table-api-scala-bridge"))
    implementation(project(":flink-table:flink-table-planner"))
    implementation(project(":flink-libraries:flink-cep"))
}

description = "flink-table-uber"
