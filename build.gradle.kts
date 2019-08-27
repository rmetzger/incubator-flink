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
    apply(plugin = "java-library")

    configure<JavaPluginConvention> {
        sourceCompatibility = JavaVersion.VERSION_1_8
        targetCompatibility = JavaVersion.VERSION_1_8
    }

    repositories {
        mavenCentral()
        mavenLocal()
        maven(url = "https://packages.confluent.io/maven/")
    }

    tasks.withType<JavaCompile>().configureEach {
        options.encoding = "UTF-8"
    }

    dependencies {
        // TODO move these to only the modules that need them and remove them
        "implementation"(Libs.slf4j_api)
        "implementation"(Libs.jsr305)
        "testImplementation"(Libs.junit)
        "testImplementation"(Libs.mockito_core)
        "testImplementation"(Libs.powermock_module_junit4)
        "testImplementation"(Libs.powermock_api_mockito2)
        "testImplementation"(Libs.hamcrest_all)
        "testImplementation"(Libs.slf4j_log4j12)
        "testImplementation"(Libs.log4j)
    }
}
