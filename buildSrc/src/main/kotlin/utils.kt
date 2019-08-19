import org.gradle.api.Project
import org.gradle.api.tasks.ScalaSourceSet
import org.gradle.api.tasks.SourceSetContainer
import org.gradle.jvm.tasks.Jar

import org.gradle.kotlin.dsl.*

/**
 * Configures the current project to provide a test jar under the
 * "testArtifacts" configuration.
 */
fun Project.flinkCreateTestJar() {
    val testArtifacts by configurations.creating {
        extendsFrom(configurations.get("testRuntime"))
    }

    val testJar by tasks.register<Jar>("testJar") {
        archiveClassifier.set("tests")
        val testSourceSet = project.the<SourceSetContainer>()["test"]
        from(testSourceSet.output)
    }

    artifacts {
        add("testArtifacts", testJar)
    }
}

/**
 * Configures the current project to compile Scala and Java together instead of one after the other.
 */
fun Project.flinkJointScalaJavaCompilation() {
    val sourceSets = the<SourceSetContainer>()
    sourceSets {
        named("main") {
            withConvention(ScalaSourceSet::class) {
                scala {
                    setSrcDirs(listOf("src/main/scala", "src/main/java"))
                }
            }
            java {
                setSrcDirs(emptyList<String>())
            }
        }

        named("test") {
            withConvention(ScalaSourceSet::class) {
                scala {
                    setSrcDirs(listOf("src/test/scala", "src/test/java"))
                }
            }
            java {
                setSrcDirs(emptyList<String>())
            }
        }
    }
}

/**
 * Configures the current project to first compile Scala, then Java. The default order is the other
 * way round with the Gradle scala plugin.
 */
fun Project.flinkCompileScalaFirst() {
    // TODO this doesn't work yet
//    val compileJava by tasks.existing(JavaCompile::class)
//    val compileScala by tasks.existing(ScalaCompile::class)
//    compileJava {
//        dependsOn(compileScala)
//    }
//    compileScala {
//        dependsOn -= compileJava
//    }
}

