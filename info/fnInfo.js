'use strict';
const FnJs = require('fn_js');
const BB = require('bluebird');
const { fnApiUrl } = require('../utils/util');


class FNInfo {
    constructor(serverless, options) {
        this.serverless = serverless;
        this.options = options || {};
        this.provider = this.serverless.getProvider('fn');
        this.commands = {
            info: {
                usage: 'Display information about the current functions',
                lifecycleEvents: [
                    'info',
                ],
                options: {
                    verbose: {
                        usage: 'Display metadata',
                        shortcut: 'v',
                    },
                },
            },
        };
        this.hooks = {
            'info:info': () => BB.bind(this)
            .then(this.getApp)
            .then(this.infoApp)
            .then(this.getRoutes)
            .each(this.infoFunc),
            // .then(console.log)
            // .catch(this.error)
            // .error(this.error),
        };
    }

    error(obj) {
        console.log('errored:');
        console.log(obj);
        console.log(obj.error);
        console.log('props:');
        Object.keys(obj).forEach(([prop, val]) => { console.log(`prop: ${prop} val:${val}`); });
    }

    infoApp(app) {
        console.log(JSON.stringify(app, null, 4));
        return BB.resolve(`app ${app} info printed`);
    }

    getApp() {
        this.serverless.cli.log('Here is the info for the function');
        const apiInstance = new FnJs.AppsApi();
        apiInstance.apiClient.basePath = fnApiUrl();

        const appName = this.serverless.service.serviceObject.name;
        if (appName === '' || appName === undefined) {
            return BB.reject('No service name defined in serverless yaml.');
        }

        return apiInstance.appsAppGet(appName).then((app) => app.app);
    }

    getRoutes() {
        const app = this.serverless.service.serviceObject.name;
        if (app === '' || app === undefined) {
            return BB.reject('No service provided');
        }
        const apiInstance = new FnJs.RoutesApi();
        apiInstance.apiClient.basePath = fnApiUrl();
        return apiInstance.appsAppRoutesGet(app).then((funcs) => funcs.routes);
    }

    infoFunc(func) {
        console.log(JSON.stringify(func, null, 4));
        return BB.resolve(`func ${func.name} info printed`);
    }
}

module.exports = FNInfo;
