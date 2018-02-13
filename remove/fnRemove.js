'use strict';

class FNRemove {
  constructor(serverless, options) {
    this.serverless = serverless;
    this.options = options || {};
    this.provider = this.serverless.getProvider('fn');

    this.hooks = {
      'remove:remove': this.removeFunction.bind(this),
    };
  }

  removeFunction() {
    this.serverless.cli.log("I am removing a function")

    const parsedFunctions = _.map(
      this.serverless.service.functions,
      (f, id) => _.assign({ id }, f)
    );
    this.serverless.cli.log("The parsed fucntions is", parsedFunctions)
  }
}

module.exports = FNRemove;
