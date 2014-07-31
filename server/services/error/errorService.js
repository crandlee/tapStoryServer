"use strict";

var logSvc = require('../logging/logService');
var extend = require('extend');
var promiseSvc = require('../promises/promiseService');

function throwError(err, msg, internalCode) {

    throw new Error(buildAndLogError(err, msg, internalCode));
}

function buildAndLogError(err, msg, internalCode) {
    err = err || {};
    if (internalCode) err = extend(err, { 'serverInternalCode' : internalCode });
    return logSvc.logError(msg, err);
}

function errorFromPromise(pid, err, msg, internalCode) {
    promiseSvc.reject(buildAndLogError(err, msg, internalCode), pid);
}

function checkErrorCode(err, code) {
    return (err && err.serverInternalCode && err.serverInternalCode === code);
}

module.exports = function(logOptions, source) {

    source = source || 'Application';
    logSvc = logSvc.initialize(logOptions, source);
    return {

        throwError: throwError,
        buildAndLogError: buildAndLogError,
        errorFromPromise: errorFromPromise,
        checkErrorCode: checkErrorCode

    };
};
