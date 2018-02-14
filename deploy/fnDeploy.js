'use strict';
const CircularJSON = require('circular-json');
const { execSync,spawnSync } = require('child_process');
const util = require('util')

class FNDeploy {
  constructor(serverless, options) {
    this.serverless = serverless;
    this.options = options || {};
    this.provider = this.serverless.getProvider('fn');

    this.hooks = {
      'deploy:deploy': this.deploy.bind(this),
    };
  }

  deploy() {
      var dockerUser = this.serverless.service.provider["fn-user"];
      var service = this.serverless.service.service;
      var res = spawnSync('fn', ['deploy','--app',service, '--registry', dockerUser,'--all'], {stdio: 'inherit'});
      var res = 0
      if (res.status > 0) {
        process.exit(res.status)
      }
  }
}

module.exports = FNDeploy;
