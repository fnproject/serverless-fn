'use strict';
const LangHelper = require('./base');
const { spawnSync } = require('child_process');

class DotNetHelper extends LangHelper {
    runtime() {
        return this.langStrings()[0];
    }

    langStrings() {
        return ['dotnet'];
    }
    extensions() {
        return ['.cs', '.fs'];
    }
    buildFromImage() {
        return 'microsoft/dotnet:1.0.1-sdk-projectjson';
    }
    runFromImage() {
        return 'microsoft/dotnet:runtime';
    }

    entrypoint() {
        return 'dotnet dotnet.dll';
    }

    hasPreBuild() {
        return true;
    }

    // PreBuild for Go builds the binary so the final image can be as small as possible
    preBuild() {
        const wd = process.cwd();

        const args = [
            'run',
            '--rm', '-v',
            `${wd}:/dotnet`, '-w', '/dotnet',
            'microsoft/dotnet:1.0.1-sdk-projectjson',
            '/bin/sh', '-c',
            'dotnet restore && dotnet publish -c release -b /tmp -o .',
        ];

        const res = spawnSync('docker', args, { stdio: 'inherit' });
        if (res.status !== 0) {
            throw new Error('failed to run prebuild command:', args);
        }
    }

    afterBuild() {

    }

}

module.exports = DotNetHelper;
