'use strict';
const BB = require('bluebird');
const FN = require('fn_js');
const { fnApiUrl } = require('../utils/util');

class FNLogs {
    constructor(serverless, options) {
        this.serverless = serverless;
        this.options = options || {};
        this.provider = this.serverless.getProvider('fn');
        this.commands = {
            logs: {
                usage: 'Output the logs of a deployed function',
                lifecycleEvents: [
                    'logs',
                ],
                options: {
                    count: {
                        usage: 'Number of lines to print',
                        shortcut: 'n',
                    },
                },
            },
        };
        this.hooks = {
            'logs:logs': () => BB.bind(this)
                .then(this.getCalls)
                .mapSeries(this.getLog)
                .mapSeries(this.printLog),
        };
    }

    getLog(call) {
        const apiInstance = new FN.LogApi();
        apiInstance.apiClient.basePath = fnApiUrl();

        const app = this.serverless.service.serviceObject.name;
        return apiInstance.appsAppCallsCallLogGet(app, call.id).then((log) => log.log);
    }

    getCalls() {
        const apiInstance = new FN.CallApi();
        apiInstance.apiClient.basePath = fnApiUrl();

        const app = this.serverless.service.serviceObject.name;
        const func = this.serverless.service.functions[this.options.f];
        if (!func.path.startsWith('/')) {
            func.path = `/${func.path}`;
        }

        const opts = {
            path: func.path,
        };

        return apiInstance.appsAppCallsGet(app, opts).then((calls) => calls.calls.reverse());
    }

    printLog(log) {
        console.log(log.log);
    }
}

module.exports = FNLogs;
