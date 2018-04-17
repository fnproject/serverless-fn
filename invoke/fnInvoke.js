'use strict';

const { fnRouteUrl } = require('../utils/util');
const axios = require('axios');
const BB = require('bluebird');

class FNInvoke {
    constructor(serverless, options) {
        this.serverless = serverless;
        this.options = options || {};
        this.provider = this.serverless.getProvider('fn');

        this.hooks = {
            'invoke:invoke': () => BB.bind(this)
                .then(this.invokeFunction)
                .then((data) => data.data)
                .then(console.log)
                .catch(console.log),
        };
    }

    invokeFunction() {
        const f = this.serverless.service.functions[this.options.f];
        if (f === undefined || f === null) {
            return BB.reject(`${this.options.f} is not a valid function for this service.`);
        }
        const url = fnRouteUrl();
        return axios.get(`${url}${this.serverless.service.serviceObject.name}/${f.path}`);
    }
}

module.exports = FNInvoke;
