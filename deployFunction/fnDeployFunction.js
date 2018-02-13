'use strict';
const FNDeploy = require('../deploy/fnDeploy');
const CircularJSON = require('circular-json');

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
    var fun = this.serverless.providers.aws.options.f;
    var serviceName = this.serverless.service.service;
    var dockerUser = this.serverless.service.provider["fn-user"];
    if (this.serverless.service.functions[fun] !== undefined) {
      console.log(fun);
    }
    // console.log(CircularJSON.stringify(this.serverless.providers))
    // console.log(CircularJSON.stringify(this.serverless.service.functions[fun]))
    // console.log(CircularJSON.stringify(this.serverless.service.provider["fn-user"]))
    console.log(dockerUser+"/"+fun)
    console.log(serviceName+"/"+fun)
  }
}

module.exports = FNDeployFunction;
