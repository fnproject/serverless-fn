'use strict';

const providerName = 'fn';

class FNProvider {
    static getProviderName() {
        return providerName;
    }

    constructor(serverless) {
        this.serverless = serverless;
        this.provider = this;
        this.serverless.setProvider(providerName, this);

        this.hooks = {
            'deploy:deploy': this.deploy.bind(this),
        };
    }

    deploy() {
        this.serverless.cli.log('I am deploying and you are using fn');
    }

}

module.exports = FNProvider;
