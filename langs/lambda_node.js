'use strict';
const LangHelper = require('./base');
const fs = require('fs');

class LambdaHelper extends LangHelper {
    runtime() {
        return this.langStrings()[0];
    }

    langStrings() {
        return ['lambda-nodejs4.3', 'lambda-node-4'];
    }

// This shouldn't match any auto-detection so returning empty slice here
    extensions() {
        return [];
    }

    buildFromImage() {
        return 'fnproject/lambda:node-4';
    }

    runFromImage() {
        return 'fnproject/lambda:node-4';
    }

    isMultiStage() {
        return false;
    }

    cmd() {
        return 'func.handler';
    }

    dockerfileBuildCmds() {
        const r = [];
        if (fs.existsSync('package.json')) {
            r.push('ADD package.json /function/');
            r.push('RUN npm install');
        }
	// single stage build for this one, so add files
        r.push('ADD . /function/');
        return r;
    }
}

module.exports = LambdaHelper;
