'use strict';

const { fnRouteUrl, getFuncPath } = require('../utils/util');
const axios = require('axios');
const BB = require('bluebird');
const fs = require('fs');
const FnLogs = require('../logs/fnLogs');

class FNInvoke {
    constructor(serverless, options) {
        this.serverless = serverless;
        this.options = options || {};
        this.provider = this.serverless.getProvider('fn');

        this.hooks = {
            'invoke:invoke': () => BB.bind(this)
                .then(this.invokeFunction)
                .then(this.log),
        };
    }

    log(data) {
        console.log(data.data);
        if (this.options.log) {
            const logs = new FnLogs(this.serverless, this.options);
            const call = {};
            call.id = data.headers.fn_call_id;
            return logs.getLog(call)
                .then((log) => console.log(log.log))
                .then(() => data.data);
        }
        return data.data;
    }

    invokeFunction() {
        let funParam = this.options.function;
        if (funParam === undefined) {
            funParam = this.options.f;
        }
        if (funParam === undefined || funParam === null || funParam === '') {
            return BB.reject('No valid function provided please provide' +
                ' --function or -f to invoke.');
        }

        let f = this.serverless.service.functions[funParam];
        if (f === undefined || f === null) {
            for (const func in this.serverless.service.functions) {
                const path = getFuncPath(this.serverless.service.functions[func], func);
                if (path.replace('/', '') === funParam.replace('/', '')) {
                    f = this.serverless.service.functions[func];
                    break;
                }
            }

            if (f === undefined || f === null) {
                return BB.reject(`${this.options.f} is not a valid function for this service.`);
            }
        }
        let url = fnRouteUrl();
        const funcpath = getFuncPath(f);

        url = `${url}/${this.serverless.service.serviceObject.name}/${funcpath}`;
        this.serverless.cli.log(`Calling Function: ${url}`);
        if (this.options.path !== undefined) {
            const cwd = process.cwd();
            return axios.post(url, fs.readFileSync(`${cwd}/${this.options.path}`));
        }

        if (this.options.data !== undefined) {
            return axios.post(url, this.options.data);
        }
        return axios.get(url);
    }
}

module.exports = FNInvoke;
