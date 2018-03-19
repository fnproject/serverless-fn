'use strict';

class FNLogAllSteps {
  constructor(serverless, options) {
    this.serverless = serverless;
    this.options = options || {};
    this.provider = this.serverless.getProvider('fn');

    this.hooks = {
      'deploy:function:deploy': this.log('deploy:function:deploy').bind(this),
      'deploy:deploy': this.log('deploy:deploy').bind(this),
      'before:deploy:deploy': this.log('before:deploy:deploy').bind(this),
      'after:deploy:deploy': this.log('after:deploy:deploy').bind(this),
      'deploy:finalize': this.log('deploy:finalize').bind(this),
      'package:initialize': this.log('package:initialize').bind(this),
      'package:setupProviderConfiguration': this.log('package:setupProviderConfiguration').bind(this),
      'package:createDeploymentArtifacts': this.log('package:createDeploymentArtifacts').bind(this),
      'package:compileFunctions': this.log('package:compileFunctions').bind(this),
      'package:finalize': this.log('package:finalize').bind(this),
    };
  }

  log(lifeCyclePoint) {
      return function(){
          console.log(lifeCyclePoint)
      }
  }
}

module.exports = FNLogAllSteps;
