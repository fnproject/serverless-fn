'use strict';

class FNInfo {
  constructor(serverless, options) {
    this.serverless = serverless;
    this.options = options || {};
    this.provider = this.serverless.getProvider('fn');
    this.commands = {
      info: {
        usage: 'Display information about the current functions',
        lifecycleEvents: [
          'info',
        ],
        options: {
          verbose: {
            usage: 'Display metadata',
            shortcut: 'v',
          },
        },
      },
    };
    this.hooks = {
      'info:info': this.infoFunction.bind(this),
    };
  }

  infoFunction() {
      this.serverless.cli.log("Here is the info for the function")
  }
}

module.exports = FNInfo;
