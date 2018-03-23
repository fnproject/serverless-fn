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
            'deploy:deploy': () => BB.bind(this).then(this.prepareFuncs)
            .mapSeries(this.deployFunc),
        };
    }

    prepareFuncs() {
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
            BB.reject('No service name defined in serverless yaml.');
        }
        const svc = this.serverless.service.serviceObject;
            // console.log(appName)
            // console.log(svc)
            // bump version // increase number seems easy enough...
        const cwd = process.cwd();

        const funcs = [];
        _.each(this.serverless.service.functions, (func, dir) => {
            func.appName = appName;
            funcs.push({ func, dir, cwd, svc });
        });
        return funcs;
    }


    deployFunc(funcDir) {
        const { func,
             dir,
             cwd,
             svc } = funcDir;
         // XXX local flag
         // XXX noCache flag

        const steps = [
            this.bumpIt,
            this.localCmd,
            this.dockerBuild,
            this.dockerPush,
            this.routeUpdate,
        ];

        // try {
            // Each function should have dir. First change to it.
        if (!fs.existsSync(dir)) {
            return BB.reject(`function ${dir}, does not exist`);
        }

        this.mergeConfigs(svc, func);

        if (dir !== cwd) {
            process.chdir(dir);

            func.dir = `${cwd}/${dir}`;

            if (!(func.name !== '')) {
                func.name = dir;
            }

            if (func.path === '' | func.path === undefined || func.path === null) {
                func.path = dir;
            }
        }

        if (!fs.existsSync('Dockerfile')) {
            // XXX logic for no Dockerfile in the func folder.
            // XXX add the pre build and after build to steps list if there is nod docker file.
            // Lang helper stuff
            // if (false && (helper !== undefined && helper !== null)) {
                // post lang helper.
                // return db.then(() => { helper.afterBuild; });
            // }
            return BB.reject(`cannot find Dockerfile: ${func.name}`);
        }

        // Root func. Cant happen right now. Need special logic.
        // Figure out this...
        // return this.deployFuncWrapper(func, appName, cwd, `${cwd}/${dir}`);


        return BB.mapSeries(steps, (s) => {
            s(func);
        });

        // Maybe start convo about weather we should keep the docker
        // file there or not. Since the lang helpers can change.

        // } catch (err) {
        //     fail(err);
        // }
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
            console.log(cmd);
            const res = spawnSync('/bin/sh', ['-c', cmd], { stdio: 'inherit', cwd: dir });
            if (res.status > 0) {
                return BB.reject(`${cmd} failed: ${res.status}`);
            }
            return BB.resolve('command succeeded');
        });
    }

    dockerBuild(func) {
        const args = ['build', '-t', func.imageName, '-f', `${func.dir}/Dockerfile`];
        if (func.noCache) {
            args.push('--no-cache');
        }
        args.push('--build-arg', 'HTTP_PROXY');
        args.push('--build-arg', 'HTTPS_PROXY');
        args.push(func.dir);
        console.log(args);
        const res = spawnSync('docker', args, { stdio: 'inherit' });
        if (res.status !== 0) {
            console.log(res);
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
        apiInstance.apiClient.basePath = 'http://127.0.0.1:8080/v1'.replace(/\/+$/, '');

        const body = new FN.RouteWrapper(); // RouteWrapper | One route to post.
        body.route = {
            image: func.imageName,
            config: func.config,
        };

        return apiInstance.appsAppRoutesRoutePut(appName, func.path, body);
    }
}

module.exports = FNDeploy;
