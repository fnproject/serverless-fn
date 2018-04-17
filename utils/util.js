'use strict';

const localHost = 'http://127.0.0.1:8080/v1'.replace(/\/+$/, '');

module.exports.fnApiUrl = function () {
    return (process.env.FN_API_URL ?
        process.env.FN_API_URL.replace(/\/+$/, '') : localHost);
};
