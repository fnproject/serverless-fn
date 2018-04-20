'use strict';

const localHost = 'http://127.0.0.1:8080/'.replace(/\/+$/, '');

module.exports.fnApiUrl = function () {
    return (process.env.FN_API_URL ?
        `${process.env.FN_API_URL.replace(/\/+$/, '')}/v1` : `${localHost}/v1`);
};

module.exports.fnRouteUrl = function () {
    return (process.env.FN_API_URL ?
        `${process.env.FN_API_URL.replace(/\/+$/, '')}/r` : `${localHost}/r`);
};
