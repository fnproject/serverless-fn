'use strict';

// LangHelper is the interface that language helpers must implement.
class LangHelper {
    // Handles return whether it can handle the passed in lang string or not
    handles(lang) { // lang normally tanks a language to use to determine if it can handle it.
        for (const l of this.langStrings()) {
            if (lang === l) {
                return true;
            }
        }
        return false;
    }
    // LangStrings returns list of supported language strings user can use for runtime
    langStrings() {
        return [''];
    }
    // Extension is the file extension this helper supports. Eg: .java, .go, .js
    extensions() {
        return [''];
    }
    // Runtime that will be used for the build (includes version)
    runtime() {
        return '';
    }
    // BuildFromImage is the base image to build off, typically fnproject/LANG:dev
    buildFromImage() {
        return '';
    }
    // RunFromImage is the base image to use for deployment (usually smaller than the build images)
    runFromImage() {
        return '';
    }
    // If set to false, it will use a single Docker build step, rather than multi-stage
    isMultiStage() {
        return true;
    }
    // Dockerfile build lines for building dependencies or anything else language specific
    dockerfileBuildCmds() {
        return [''];
    }
    // DockerfileCopyCmds will run in second/final stage of multi-stage
    // build to copy artifacts form the build stage
    dockerfileCopyCmds() {
        return [''];
    }
    // Entrypoint sets the Docker Entrypoint. One of Entrypoint or Cmd is required.
    entrypoint() {
        return '';
    }
    // Cmd sets the Docker command. One of Entrypoint or Cmd is required.
    cmd() {
        return '';
    }
    // DefaultFormat provides the default fn format to set in func.yaml
    // fn init, return "" for an empty format.
    defaultFormat() {
        return '';
    }
    hasPreBuild() {
        return '';
    }
    preBuild() {

    }
    afterBuild() {

    }
    // HasBoilerplate indicates whether a language has support for generating function boilerplate.
    hasBoilerplate() {
        return false;
    }
    // GenerateBoilerplate generates basic function boilerplate.
    // Returns ErrBoilerplateExists if the function file already exists.
    generateBoilerplate() {

    }
    // FixImagesOnInit determines if images should be fixed on initialization
    // BuildFromImage and RunFromImage will be written to func.yaml
    fixImagesOnInit() {
        return false;
    }
}

module.exports = LangHelper;
