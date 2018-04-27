'use strict';
const LangHelper = require('./base');
const fs = require('fs');

class GoHelper extends LangHelper {
    runtime() {
        return this.langStrings()[0];
    }

    defaultFormat() {
        return 'json';
    }

    langStrings() {
        return ['go'];
    }

    extensions() {
        return ['.go'];
    }

    buildFromImage() {
        return 'fnproject/go:dev';
    }

    runFromImage() {
        return 'fnproject/go';
    }

    dockerfileBuildCmds() {
        const cmds = [];
        if (!fs.existsSync('vendor/') && fs.existsSync('Gopkg.toml')) {
            cmds.push('RUN go get -u github.com/golang/dep/cmd/dep');
            if (fs.existsSync('Gopkg.lock')) {
                cmds.push('ADD Gopkg.* /go/src/func/');
                cmds.push('RUN cd /go/src/func/ && dep ensure --vendor-only');
                cmds.push('ADD . /go/src/func/');
            } else {
                cmds.push('ADD . /go/src/func/');
                cmds.push('RUN cd /go/src/func/ && dep ensure');
            }
        } else {
            cmds.push('ADD . /go/src/func/');
        }
        cmds.push('RUN cd /go/src/func/ && go build -o func');

        return cmds;
    }

    dockerfileCopyCmds() { return ['COPY --from=build-stage /go/src/func/func /function/']; }

    entrypoint() { return './func'; }

    hasBoilerplate() { return false; }// XXX Return true after genboiler added

    generateBoilerplate() {
        // XXX Finish boiler plate conversion
    }

}

module.exports = GoHelper;
