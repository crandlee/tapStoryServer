var logSvc = require('../logging/logService');
var extend = require('extend');

function initialize(logOptions, source) {
    logSvc = logSvc.initialize(logOptions, source);
    return this;
}
function throwError(err, msg, internalCode) {

    throw new Error(buildAndLogError(err, msg, internalCode));
}

function buildAndLogError(err, msg, internalCode) {
    err = err || {};
    if (internalCode) err = extend(err, { 'serverInternalCode' : internalCode });
    return logSvc.logError(msg, err);
}

function errorFromPromise(deferred, err, msg, internalCode) {
    deferred.reject(buildAndLogError(err, msg, internalCode));
}

function checkErrorCode(err, code) {
    return (err && err.serverInternalCode && err.serverInternalCode === code);
}

module.exports = {
    initialize: initialize,
    throwError: throwError,
    buildAndLogError: buildAndLogError,
    errorFromPromise: errorFromPromise,
    checkErrorCode: checkErrorCode
};