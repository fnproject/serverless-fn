'use strict';
const fs = require('fs');
const LangHelper = require('./base');

class NodeHelper extends LangHelper {
    runtime() {
        return this.langStrings()[0];
    }

    langStrings() {
        return ['node'];
    }
    extensions() {
	// this won't be chosen by default
        return ['.js'];
    }

    buildFromImage() {
        return 'fnproject/node:dev';
    }
    runFromImage() {
        return 'fnproject/node';
    }

    hasBoilerplate() { return false; }// XXX Add boilerplate

    defaultFormat() { return 'json'; }

    entrypoint() {
        return 'node func.js';
    }

    dockerfileBuildCmds() {
        const r = [];
	// skip npm -install if node_modules is local - allows local development
        if (fs.existsSync('package.json') && !fs.existsSync('node_modules')) {
            if (fs.existsSync('package-lock.json')) {
                r.push('ADD package-lock.json /function/');
            }

            r.push('ADD package.json /function/');
            r.push('RUN npm install');
        }
        return r;
    }

    dockerfileCopyCmds() {
	// excessive but content could be anything really
        const r = ['ADD . /function/'];
        if (fs.existsSync('package.json') && !fs.existsSync('node_modules')) {
            r.push('COPY --from=build-stage /function/node_modules/ /function/node_modules/');
        }
        return r;
    }

}

module.exports = NodeHelper;
