"use strict";
require('require-enhanced')();

var logSvc = global.rootRequire('svc-logging');
var extend = require('extend');
var promiseSvc = global.rootRequire('svc-promise');
var _ = require('lodash');

function throwError(err, msg, method, internalCode) {

    throw new Error(buildAndLogError(err, msg, method, internalCode));
}

function buildAndLogError(err, msg, method, internalCode) {
    err = err || {};
    if (internalCode) err = extend(err, { 'serverInternalCode' : internalCode });
    return logSvc.logError(msg, err, method);
}

function errorFromPromise(pid, err, msg, method, internalCode) {
    promiseSvc.reject(stripDetailsFromFinal(buildAndLogError(err, msg, method, internalCode)), pid);
}

function stripDetailsFromFinal(obj) {
    //Allow us to hide properties from what is shown to user
    //They may have too many details about internals.  Generally these
    //should still appear in the log
    if (obj) {
        _.forOwn(obj, function(num, key) {
            if (_.indexOf(['errorRef', 'serverMessage'], key) === -1)
                delete obj[key];
        });
    }
    return obj;
}
function checkErrorCode(err, code) {
    return (err && err.serverInternalCode && err.serverInternalCode === code);
}

module.exports = (function(logOptions) {

    logSvc = logSvc.initialize(logOptions);
    return {

        throwError: throwError,
        buildAndLogError: buildAndLogError,
        errorFromPromise: errorFromPromise,
        checkErrorCode: checkErrorCode

    };
}());
