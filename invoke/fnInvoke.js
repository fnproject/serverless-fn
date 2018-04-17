'use strict';

const { fnApiUrl } = require('../utils/util');

class FNInvoke {
    constructor(serverless, options) {
        this.serverless = serverless;
        this.options = options || {};
        this.provider = this.serverless.getProvider('fn');

        this.hooks = {
            'invoke:invoke': this.invokeFunction.bind(this),
        };
    }

    invokeFunction() {
        console.log(this.options.f, this.serverless.service.functions[this.options.f]);
        console.log(this.options.data);
        console.log(fnApiUrl());

        this.serverless.cli.log('I am invoking a functions');
    }
}

module.exports = FNInvoke;
