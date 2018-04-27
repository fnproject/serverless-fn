'use strict';

const localHost = 'http://localhost:8080/'.replace(/\/+$/, '');

module.exports.fnApiUrl = function () {
    return (process.env.FN_API_URL ?
        `${process.env.FN_API_URL.replace(/\/+$/, '')}/v1` : `${localHost}/v1`);
};

module.exports.fnRouteUrl = function () {
    return (process.env.FN_API_URL ?
        `${process.env.FN_API_URL.replace(/\/+$/, '')}/r` : `${localHost}/r`);
};

module.exports.getFuncPath = function (func, dir) {
    let path = dir;
    for (let evt = 0; evt < func.events.length; evt++) {
        if (func.events[evt].http !== undefined) {
            path = func.events[evt].http.path;
        }
    }
    if (path === undefined || path === null || path === '') {
        path = func.name;
    }

    if (!path.startsWith('/')) {
        path = `/${path}`;
    }

    return path;
};

module.exports.getFunc = function (funParam, functions) {
    let f = functions[funParam];
    if (f === undefined || f === null) {
        for (const func in functions) {
            const path = module.exports.getFuncPath(functions[func], func);
            if (path.replace('/', '') === funParam.replace('/', '')) {
                f = functions[func];
                break;
            }
        }
    }
    return f;
};
