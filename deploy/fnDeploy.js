'use strict';
const { spawnSync } = require('child_process');
const BB = require('bluebird');
const FN = require('fn_js');
const util = require('util');
const semver = require('semver');
const _ = require('lodash');
const fs = require('fs');

class FNDeploy {
    constructor(serverless, options) {
        this.serverless = serverless;
        this.options = options || {};
        this.provider = this.serverless.getProvider('fn');

        this.hooks = {
            'deploy:deploy': () => BB.bind(this).then(this.deploy),
        };
    }

    deploy() {
        return new BB((resolve, reject) => {
                /*
                    load app file  determine app name but also config --app
                    flag... Not needed since need service.yaml
                    deploy all functions

                    registry... inyaml
                    app file in yaml
                    appname in yaml
                    Here always deploys all funcs in yaml
                    Use same deploy func for single as multi and iterate over

                    deploy func:
                    build docker image // exec to docker... Lang
                    helpers etc... Grrr Start with docker file only.. Then move on from there....
                    docker push // exec to docker
                    update route in fn. // json post to fn using fn api json
                */
                // var dockerUser = this.serverless.service.provider['fn-user'];

            const appName = this.serverless.service.serviceObject.name;
            if (appName === '' || appName === undefined) {
                reject('No service name defined in serverless yaml.');
                return;
            }
            const svc = this.serverless.service.serviceObject;
                // console.log(appName)
                // console.log(svc)
                // bump version // increase number seems easy enough...
            const cwd = process.cwd();

            let allGood = true;
            let funcFound = false;
            _.each(this.serverless.service.functions, (func, dir) => {
                try {
                        // Each function should have dir. First change to it.
                    if (!fs.existsSync(dir)) {
                        reject(`function ${dir}, does not exist`);
                        return;
                    }

                    if (dir === cwd) {
                        // Root func. Cant happen right now. Need special logic.
                    } else {
                        process.chdir(dir);

                        if (!(func.name != '')) {
                            func.name = dir;
                        }

                        if (func.path === '' | func.path === undefined || func.path === null) {
                            func.path = dir;
                        }
                    }

                    this.mergeConfigs(svc, func);

                    // Maybe start convo about weather we should keep the docker
                    // file there or not. Since the lang helpers can change.
                    this.deployFunc(func, appName, cwd, `${cwd}/${dir}`, reject);

                    funcFound = true;
                } catch (err) {
                    allGood = false;
                    reject(err);
                }
            });
            if (!allGood) {
                reject('Should have left in the reject on error.');
                return;
            }

            if (!funcFound) {
                reject('No functions found to deploy');
                return;
            }
            resolve('Got to the end');
        });
    }

    mergeConfigs(svc, func) {
        if (svc.config !== undefined && svc.config !== null) {
            if (func.config === null || func.config === undefined) {
                func.config = {};
            }
            Object.keys(svc.config).forEach((key) => {
                if (func.config[key] === null || func.config[key] === undefined) {
                    func.config[key] = svc.config[key];
                }
            });
        }
    }

    deployFunc(func, appName, baseDir, fdir, reject) {
        // XXX Get this from args... Figure out how to pass args
        const noCache = false;
        this.bumpIt(func);

        this.buildFunc(func, fdir, noCache, reject);

        // XXX add flag for local.. Figure out flags
        if (true) { // local flag
            this.dockerPush(func, reject);
        }

        // var apiInstance = new FN.AppsApi();
        // apiInstance.apiClient.basePath = 'http://127.0.0.1:8080/v1'.replace(/\/+$/, '');
        //
        // var app = "serverless-hello-world"; // String | name of the app.
        //
        // apiInstance.appsAppGet(app).then(function(data) {
        //     console.log('API called successfully. Returned data: ' + data);
        //     resolve(data)
        // }, function(error) {
        //     // console.error(error.response.text);
        //     reject(error.response.text)
        // });
    }

    bumpIt(func) {
        // Should we just bump. Verify that this is a valid version...?
        // Or should we check to see currently deployed version. And use that and call bump on that?
        // Not sure how to save back to the yaml file. Save the entire thing?
        // Where do I get that representation?
        // Cannot save since no way to preserve the comments in the file. Maybe regex the file
        // for the one version number and make sure its in the func section.... not easy..
        func.version = semver.inc(func.version, 'patch'); // How to save this?

        // Add the rest of the logic to make sure version is not blank etc... Save.
    }

    buildFunc(func, fdir, noCache, reject) {
        this.localBuild(fdir, func.build, reject);

        this.dockerBuild(fdir, func, noCache, reject);
    }

    localBuild(fdir, buildCmds, reject) {
        console.log('Localbuild');
        console.log(fdir, buildCmds);
        if (buildCmds !== undefined && buildCmds !== null) {
            _.each(buildCmds, (cmd) => {
                console.log(cmd);
                const res = spawnSync('/bin/sh', ['-c', cmd], { stdio: 'inherit', cwd: fdir });
                if (res.status > 0) {
                    reject(`${cmd} failed: ${res.status}`);
                }
            });
        }
    }

    dockerBuild(fdir, func, noCache, reject) {
        // Check docker version
        if (!fs.existsSync(`${fdir}/Dockerfile`)) {
            reject(new Error(`cannot find ${fdir}/Dockerfile`));
            // Lang helper stuff
            return;
        }

        this.runDockerBuild(fdir, func, noCache, reject);

        if (false && (helper !== undefined && helper !== null)) {
            // post lang helper.
            const err = helper.afterBuild();
            if (err !== undefined) {
                reject(err);
            }
        }
    }

    runDockerBuild(fdir, func, noCache, reject) {
        const args = ['build', '-t', func.imageName, '-f', `${fdir}/Dockerfile`];
        if (noCache) {
            args.push('--no-cache');
        }
        args.push('--build-arg', 'HTTP_PROXY');
        args.push('--build-arg', 'HTTPS_PROXY');
        args.push(fdir);
        console.log(args);
        const res = spawnSync('docker', args, { stdio: 'inherit' });
        if (res.status !== 0) {
            console.log(res);
            reject(new Error('docker command failed'));
        }
    }

    dockerPush(func, reject) {
        // XXX check valid image name..
        this.serverless.log(`Pushing ${func.imageName} to docker registry....`);
        const res = spawnSync('docker', ['push', func.imageName], { stdio: 'inherit' });
        if (res.status !== 0) {
            reject(new Error(`failed to push ${func.imageName}`));
        }
    }
}

module.exports = FNDeploy;
