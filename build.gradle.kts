buildscript {
    repositories {
        mavenCentral()
        jcenter()
        maven(url = "https://plugins.gradle.org/m2/")
    }
    apply(from = "$rootDir/gradle/dependencies.gradle")
}

plugins {
    id("de.fayard.buildSrcVersions") version "0.4.2"
}

allprojects {
    group = "org.apache.flink"
    version = "1.10-SNAPSHOT"
}

subprojects {
    apply(plugin = "java")

    repositories {
        mavenCentral()
        mavenLocal()
        maven(url = "https://packages.confluent.io/maven/")
    }

    configure<JavaPluginConvention> {
        sourceCompatibility = JavaVersion.VERSION_1_8
        targetCompatibility = JavaVersion.VERSION_1_8
    }

    tasks.withType<JavaCompile>().configureEach {
        options.encoding = "UTF-8"
    }

    dependencies {
        // TODO move these to only the modules that need them and remove them
        "implementation"("org.slf4j:slf4j-api:1.7.15")
        "implementation"("com.google.code.findbugs:jsr305:1.3.9")
        "testImplementation"("junit:junit:4.12")
        "testImplementation"("org.mockito:mockito-core:2.21.0")
        "testImplementation"("org.powermock:powermock-module-junit4:2.0.2")
        "testImplementation"("org.powermock:powermock-api-mockito2:2.0.2")
        "testImplementation"("org.hamcrest:hamcrest-all:1.3")
        "testImplementation"("org.slf4j:slf4j-log4j12:1.7.15")
        "testImplementation"("log4j:log4j:1.2.17")
    }
}
