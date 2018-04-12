'use strict';
const BB = require('bluebird');
const FN = require('fn_js');

class FNRemove {
    constructor(serverless, options) {
        this.serverless = serverless;
        this.options = options || {};
        this.provider = this.serverless.getProvider('fn');

        this.hooks = {
            'remove:remove': () => BB.bind(this)
            .then(this.removeFunction)
            .then(this.removed),
        };
    }

    removeFunction() {
        const apiInstance = new FN.AppsApi();
        apiInstance.apiClient.basePath = 'http://127.0.0.1:8080/v1'.replace(/\/+$/, '');
        const app = this.serverless.service.serviceObject.name;

        return apiInstance.appsAppDelete(app);
    }

    removed() {
        console.log(`Service: ${this.serverless.service.serviceObject.name} removed from fn.`);
    }
}

module.exports = FNRemove;
