'use strict';
const FNDeploy = require('../deploy/fnDeploy');
const CircularJSON = require('circular-json');
const { spawnSync } = require('child_process');

class FNDeployFunction extends FNDeploy {
  constructor(serverless, options) {
    super(serverless, options)
    this.serverless = serverless;
    this.options = options || {};
    this.hooks = {
      'deploy:function:deploy': this.deployFunction.bind(this),
    };
  }

  deployFunction() {
    var fun = this.options.f;
    var serviceName = this.serverless.service.service;
    var dockerUser = this.serverless.service.provider["fn-user"];

    var res = spawnSync('fn', ['deploy','--app',serviceName, '--registry', dockerUser,fun], {stdio: 'inherit'});
    if (res.status > 0) {
      process.exit(res.status)
    }

  }
}

module.exports = FNDeployFunction;
