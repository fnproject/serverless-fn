'use strict';
const DotnetHelper = require('./dotnet.js');
const GoHelper = require('./go.js');
const KotlinHelper = require('./kotlin.js');
const LambdaHelper = require('./lambda_node.js');
const NodeHelper = require('./node.js');
const PhpHelper = require('./php.js');
const RubyHelper = require('./ruby.js');

const helpers = [
    new DotnetHelper(),
    new GoHelper(),
    new KotlinHelper(),
    new LambdaHelper(),
    new NodeHelper(),
    new PhpHelper(),
    new RubyHelper(),
];

function GetHelper(runtime) {
    for (let i = 0; i < helpers.length; i++) {
        if (helpers[i].handles(runtime)) {
            return helpers[i];
        }
    }
    return undefined;
}

module.exports = GetHelper;
