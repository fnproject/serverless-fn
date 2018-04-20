'use strict';
const { spawnSync } = require('child_process');
const BB = require('bluebird');
const FN = require('fn_js');
const util = require('util');
const semver = require('semver');
const _ = require('lodash');
const fs = require('fs');
const getHelper = require('../langs/helpers.js');
const { fnApiUrl } = require('../utils/util');

class FNDeploy {
    constructor(serverless, options) {
        this.serverless = serverless;
        this.options = options || {};
        this.provider = this.serverless.getProvider('fn');
        this.commands = {
            deploy: {
                usage: 'Deploys your fn service.',
                lifecycleEvents: [
                    'deploy:deploy',
                ],
                options: {
                    local: {
                        usage: 'Deploy locally(no docker push)',
                        shortcut: 'l',
                    },
                    'no-cache': {
                        usage: "Don't use docker cache",
                    },
                },
            },
        };
        this.hooks = {
            'deploy:deploy': () => BB.bind(this)
            .then(this.prepareFuncs)
            .mapSeries(this.deployFunc),
            'deploy:function:deploy': () => BB.bind(this)
            .then(this.prepareFunc)
            .then(this.deployFunc),
        };
    }

    error(data) {
        console.log(data);
    }

    prepareFuncs() {
        const appName = this.serverless.service.serviceObject.name;
        if (appName === '' || appName === undefined) {
            return BB.reject('No service name defined in serverless yaml.');
        }
        const svc = this.serverless.service.serviceObject;
            // console.log(appName)
            // console.log(svc)
            // bump version // increase number seems easy enough...
        const cwd = process.cwd();

        const funcs = [];
        _.each(this.serverless.service.functions, (func, dir) => {
            func.appName = appName;
            const funcDir = { func, dir, cwd, svc };
            funcs.push(funcDir);
        });
        return funcs;
    }

    prepareFunc() {
        const appName = this.serverless.service.serviceObject.name;
        if (appName === '' || appName === undefined) {
            return BB.reject('No service name defined in serverless yaml.');
        }
        const svc = this.serverless.service.serviceObject;
            // console.log(appName)
            // console.log(svc)
            // bump version // increase number seems easy enough...
        const cwd = process.cwd();

        const func = this.serverless.service.functions[this.options.f];
        func.appName = appName;
        const dir = this.options.f;

        return BB.resolve({ func, dir, cwd, svc });
    }


    deployFunc(funcDir) {
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

        const { func,
             dir,
             cwd,
             svc } = funcDir;
         // XXX local flag
         // XXX noCache flag

        if (this.options.local) {
            func.local = true;
        }

        if (this.options.noCache) {
            func.noCache = true;
        }

        const steps = [
            this.bumpIt,
            this.localCmd,
            this.buildHelper.bind(this),
            this.dockerPush,
            this.routeUpdate,
        ];

        if (!fs.existsSync(`${cwd}/${dir}`)) {
            return BB.reject(`function ${dir}, does not exist`);
        }

        this.mergeConfigs(svc, func);

        if (dir !== cwd) {
            process.chdir(`${cwd}/${dir}`);

            func.dir = `${cwd}/${dir}`;

            if (!(func.name !== '')) {
                func.name = dir;
            }

            if (func.path === '' | func.path === undefined || func.path === null) {
                func.path = dir;
            }
        }

        func.imageName = this.imageName(func);

        // Root func. Cant happen right now. Need special logic.
        // Figure out this...
        // return this.deployFuncWrapper(func, appName, cwd, `${cwd}/${dir}`);


        return BB.mapSeries(steps, (s) => s(func));
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

    localCmd(func) {
        if (func.build === undefined || func.build === null) {
            return BB.resolve('im done 😂');
        }

        return BB.each(func.build, (cmd) => {
            const { dir } = func;
            const res = spawnSync('/bin/sh', ['-c', cmd], { stdio: 'inherit', cwd: dir });
            if (res.status > 0) {
                return BB.reject(`${cmd} failed: ${res.status}`);
            }
            return BB.resolve('command succeeded');
        });
    }

    buildHelper(func) {
        // Check for docker file.
        if (fs.existsSync('Dockerfile')) {
            const cwd = process.cwd();
            func.dockerFile = `${cwd}/Dockerfile`;
            return this.dockerBuild(func);
        }


        if (func.runtime === 'docker') {
            return BB.reject('Docker file missing for "docker" runtime');
        }
        if (func.runtime === null || func.runtime === undefined) {
            return BB.reject('Runtime not detected');
        }

        const helper = getHelper(func.runtime);
        if (helper === undefined) {
            return BB.reject(`Unable to find runtime helper for ${func.runtime}`);
        }

        func.helper = helper;
        func.dockerFile = this.writeTmpDockerFile(func);
        const steps = [
            this.preBuild,
            this.dockerBuild,
            this.postBuild,
        ];
        return BB.mapSeries(steps, (s) => { s(func); })
            .finally(this.cleanup(func.dockerFile));
    }

    imageName(func) {
        let fname = func.name;
        if (!fname.includes('/')) {
		// then we'll prefix FN_REGISTRY
            let reg = process.env.FN_REGISTRY;
            if (reg !== '') {
                if (!reg.endsWith('/')) {
                    reg += '/';
                }
                fname = `${reg}${fname}`;
            }
        }
        if (func.version !== undefined) {
            fname = `${fname}:${func.version}`;
        }
        return fname;
    }


    writeTmpDockerFile(func) {
        const helper = func.helper;

        const cwd = process.cwd();
        const dockerFile = `${cwd}/tempDockerFile`;
        let dockerFileLines = [];

       // multi-stage build: https://medium.com/travis-on-docker/multi-stage-docker-builds-for-creating-tiny-go-images-e0e1867efe5a
        let bi = func.buildImage;
        if (bi === undefined) {
            bi = helper.buildFromImage();
        }

        if (helper.isMultiStage()) {
        // build stage
            dockerFileLines.push(`FROM ${bi} as build-stage`);
        } else {
            dockerFileLines.push(`FROM ${bi}`);
        }
        dockerFileLines.push('WORKDIR /function');
        dockerFileLines = dockerFileLines.concat(helper.dockerfileBuildCmds());

        if (helper.isMultiStage()) {
		// final stage
            let ri = func.runImage;
            if (ri === undefined) {
                ri = helper.runFromImage();
            }
            dockerFileLines.push(`FROM ${ri}`);
            dockerFileLines.push('WORKDIR /function');
            dockerFileLines = dockerFileLines.concat(helper.dockerfileCopyCmds());
        }

        let addedEntry = false;
        if (func.entrypoint !== undefined) {
            const entry = this.stringToSlice(func.entrypoint);
            dockerFileLines.push(`ENTRYPOINT [${entry}]`);
            addedEntry = true;
        }

        if (func.cmd !== undefined) {
            const cmd = this.stringToSlice(func.cmd);
            dockerFileLines.push(`CMD [${cmd}]`);
            addedEntry = true;
        }

        console.log('Added Entry:', addedEntry);
        if (!addedEntry) {
            const entry = this.stringToSlice(helper.entrypoint());
            dockerFileLines.push(`ENTRYPOINT [${entry}]`);
        }

        fs.writeFileSync(dockerFile, dockerFileLines.join('\n'));

        return dockerFile;
    }

    stringToSlice(val) {
        const vals = val.split(/(\s+)/).filter((e) => e.trim().length > 0);
        vals.forEach((v, i) => {
            vals[i] = `"${v.trim()}"`;
        });

        return vals.join(', ');
    }

    preBuild(func) {
        if (func.helper.hasPreBuild()) {
            func.helper.preBuild();
        }
        return BB.resolve(func);
    }

    postBuild(func) {
        func.helper.afterBuild();
        return BB.resolve(func);
    }

    cleanup(dockerFile) {
        return () => {
            if (dockerFile !== 'Dockerfile'
            && dockerFile !== undefined
            && dockerFile !== null) {
                fs.unlinkSync(dockerFile);
            }
        };
    }

    dockerBuild(func) {
        const args = ['build', '-t', func.imageName, '-f', func.dockerFile];
        if (func.noCache) {
            args.push('--no-cache');
        }
        args.push('--build-arg', 'HTTP_PROXY');
        args.push('--build-arg', 'HTTPS_PROXY');
        args.push(func.dir);
        const res = spawnSync('docker', args, { stdio: 'inherit' });
        if (res.status !== 0) {
            return BB.reject('docker command failed');
        }
        return BB.resolve('image built successfully');
    }

    dockerPush(func) {
        if (func.local) { // local flag
            return BB.resolve('local do not docker push');
        }
        // XXX check valid image name..
        console.log(`Pushing ${func.imageName} to docker registry....`);
        const res = spawnSync('docker', ['push', func.imageName], { stdio: 'inherit' });
        if (res.status !== 0) {
            return BB.reject(`failed to push ${func.imageName}`);
        }
        return BB.resolve('func pushed');
    }

    routeUpdate(func) {
        const { appName } = func;
        const apiInstance = new FN.RoutesApi();
        apiInstance.apiClient.basePath = fnApiUrl();

        const body = new FN.RouteWrapper(); // RouteWrapper | One route to post.
        body.route = {
            image: func.imageName,
            config: func.config,
            format: func.format,
            timeout: func.timeout,
            type: func.type,
            memory: func.memory,
            idle_timeout: func.idletimeout,
            headers: func.headers,
        };


        return apiInstance.appsAppRoutesRoutePut(appName, func.path, body);
    }
}

module.exports = FNDeploy;
