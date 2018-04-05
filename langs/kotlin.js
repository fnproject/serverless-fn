'use strict';
const LangHelper = require('./base');

class KotlinHelper extends LangHelper {
    runtime() {
        return this.langStrings()[0];
    }

    extensions() {
        return ['.kt'];
    }

    langStrings() {
        return ['kotlin'];
    }

    // BuildFromImage returns the Docker image used to compile the kotlin function
    buildFromImage() {
        return 'fnproject/kotlin:dev';
    }

    // RunFromImage returns the (Java) Docker image used to run the Kotlin function.
    runFromImage() {
        return 'fnproject/fn-java-fdk:latest';
    }

    // HasBoilerplate returns whether the Java runtime has boilerplate that can be generated.
    hasBoilerplate() { return false; } // XXX add boilerplate

    // Java defaults to http
    defaultFormat() { return 'http'; }

    // GenerateBoilerplate will generate function boilerplate for a Java runtime.
    // project.
    generateBoilerplate() {
    // XXX add boilerplate
        return false;
    }

    // Cmd returns the Java runtime Docker entrypoint that will be executed
    // when the Kotlin function is executed.
    cmd() {
        return 'HelloKt::hello';
    }

    // DockerfileCopyCmds returns the Docker COPY command
    // to copy the compiled Kotlin function jar and its dependencies.
    dockerfileCopyCmds() {
        return ['COPY --from=build-stage /function/*.jar /function/app/'];
    }

    // DockerfileBuildCmds returns the build stage steps to compile the Kotlin function project.
    dockerfileBuildCmds() {
        return [
            'ADD src /function/src',
            'RUN cd /function && kotlinc src/main/kotlin/Hello.kt -include-runtime -d function.jar',
        ];
    }

    // HasPreBuild returns whether the Java Maven runtime has a pre-build step.
    hasPreBuild() { return true; }

    // PreBuild ensures that the expected the function is based is a maven project.
    preBuild() {
    }

    fixImagesOnInit() {
        return true;
    }
}

module.exports = KotlinHelper;
