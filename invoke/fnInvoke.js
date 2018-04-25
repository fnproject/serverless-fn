'use strict';

const { fnRouteUrl } = require('../utils/util');
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
        const f = this.serverless.service.functions[this.options.f];
        if (f === undefined || f === null) {
            return BB.reject(`${this.options.f} is not a valid function for this service.`);
        }
        let url = fnRouteUrl();
        let funcpath = f.path;
        if (funcpath === undefined) {
            funcpath = f.name;
        }
        url = `${url}/${this.serverless.service.serviceObject.name}/${funcpath}`;
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
