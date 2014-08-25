"use strict";
require('require-enhanced')();

var logSvc = global.rootRequire('svc-logging');
var loggingBypassed = false;

function error(msg, props, opts) {

    opts = opts || {};
    var internalCode = opts.internalCode || null;
    throw new Error(JSON.stringify(stripDetailsFromFinal(buildAndLogError(msg, props, internalCode))));

}

function promiseError(msg, props, opts) {
    return function(err) {
        props = props || {};
        if (err && err.message) {
            props = global.extend(props, { error: err.message });
        }
        error(msg, props, opts);
    };
}

function warn(msg, props, method) {

    return logSvc.logWarning(msg, props, method);

}

function buildAndLogError(msg, props, internalCode) {

    props = props || {};
    if (internalCode) props = global.extend(props, { 'serverInternalCode' : internalCode });
    return logSvc.logError(msg, props);

}

function stripDetailsFromFinal(obj) {

    //Allow us to hide properties from what is shown to user
    //They may have too many details about internals.  Generally these
    //should still appear in the log
    if (obj && !loggingBypassed) {
        global._.forOwn(obj, function(num, key) {
            if (global._.indexOf(['errorRef', 'serverMessage', 'errDisplay'], key) === -1) {
                delete obj[key];
            }
        });
    }

    return obj;

}

function checkErrorCode(err, code) {

    return (err && err.serverInternalCode && err.serverInternalCode === code);

}

function bypassLogger(shouldTurnOff) {

    loggingBypassed = shouldTurnOff;
    logSvc.bypassLogging(shouldTurnOff);

}

module.exports = (function(logOptions) {

    logSvc = logSvc.initialize(logOptions);
    return {

        bypassLogger: bypassLogger,
        error: error,
        warn: warn,
        buildAndLogError: buildAndLogError,
        checkErrorCode: checkErrorCode,
        promiseError: promiseError

    };

}());
