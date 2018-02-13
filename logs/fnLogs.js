'use strict';

class FNLogs {
  constructor(serverless, options) {
    this.serverless = serverless;
    this.options = options || {};
    this.provider = this.serverless.getProvider('fn');
    this.commands = {
      logs: {
        usage: 'Output the logs of a deployed function',
        lifecycleEvents: [
          'logs',
        ],
        options: {
          count: {
            usage: 'Number of lines to print',
            shortcut: 'n',
          },
        },
      },
    };
    this.hooks = {
      'logs:logs': this.printLogs.bind(this),
    };
  }

  printLogs(options) {
    this.serverless.cli.log("logs for a function")
  }
}

module.exports = FNLogs;
