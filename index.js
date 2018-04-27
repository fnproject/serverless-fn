'use strict';

/*
NOTE: this plugin is used to add all the different provider related plugins at once.
This way only one plugin needs to be added to the service in order to get access to the
whole provider implementation.
*/

const FNProvider = require('./provider/fnProvider');
const FNDeploy = require('./deploy/fnDeploy');
// const FNDeployFunction = require('./deployFunction/fnDeployFunction');
const FNRemove = require('./remove/fnRemove');
const FNInvoke = require('./invoke/fnInvoke');
const FNInfo = require('./info/fnInfo');
const FNLogs = require('./logs/fnLogs');

class FNIndex {
    constructor(serverless, options) {
        this.serverless = serverless;
        this.options = options;
        this.serverless.pluginManager.addPlugin(FNProvider);
        this.serverless.pluginManager.addPlugin(FNDeploy);
        this.serverless.pluginManager.addPlugin(FNRemove);
        this.serverless.pluginManager.addPlugin(FNInvoke);
        this.serverless.pluginManager.addPlugin(FNInfo);
        this.serverless.pluginManager.addPlugin(FNLogs);
    }
}

module.exports = FNIndex;
