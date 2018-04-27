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
    }

}

module.exports = FNProvider;
