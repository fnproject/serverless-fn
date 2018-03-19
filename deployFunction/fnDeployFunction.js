'use strict';
const FNDeploy = require('../deploy/fnDeploy');
const BB = require('bluebird');
// const FN = require('fn_js');
// const { spawnSync } = require('child_process');

class FNDeployFunction extends FNDeploy {
    constructor(serverless, options) {
        super(serverless, options);
        this.serverless = serverless;
        this.options = options || {};
        this.hooks = {
            'deploy:function:deploy': () => BB.bind(this)
            .then(this.deployFunction)
            .then(console.log),
        };
    }

    deployFunction() {
        const fun = this.options.f;
        const serviceName = this.serverless.service.service;
        const dockerUser = this.serverless.service.provider['fn-user'];
    }
}

module.exports = FNDeployFunction;
