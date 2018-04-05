'use strict';
const fs = require('fs');
const LangHelper = require('./base');
const { spawnSync } = require('child_process');


class PhpHelper extends LangHelper {
    runtime() {
        return this.langStrings()[0];
    }

    langStrings() {
        return ['php'];
    }
    extensions() {
        return ['.php'];
    }

    buildFromImage() {
        return 'fnproject/php:dev';
    }

    runFromImage() {
        return 'fnproject/php:dev';
    }

    entrypoint() {
        return 'php func.php';
    }

    hasPreBuild() {
        return true;
    }

    preBuild() {
        const wd = process.cwd();

        if (!fs.existsSync(`${wd}/composer.json`)) {
            return;
        }

        const args = [
            'run',
            '--rm',
            '-v',
            `${wd}:/worker`,
            '-w',
            '/worker',
            'fnproject/php:dev',
            'composer',
            'install',
        ];
        console.log('Running prebuild command:', args);
        const res = spawnSync('docker', args, { stdio: 'inherit' });
        if (res.status !== 0) {
            throw new Error('failed to run prebuild command:', args);
        }
    }

    isMultiStage() {
        return false;
    }

    dockerfileBuildCmds() {
        return ['ADD . /function/'];
    }
    afterBuild() {

    }
}

module.exports = PhpHelper;
