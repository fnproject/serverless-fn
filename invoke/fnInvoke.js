'use strict';

class FNInvoke {
    constructor(serverless, options) {
        this.serverless = serverless;
        this.options = options || {};
        this.provider = this.serverless.getProvider('fn');

        this.hooks = {
            'invoke:invoke': this.invokeFunction.bind(this),
        };
    }

    invokeFunction(func, data) {
        console.log(func, data);
        this.serverless.cli.log('I am invoking a functions');
    }
}

module.exports = FNInvoke;
