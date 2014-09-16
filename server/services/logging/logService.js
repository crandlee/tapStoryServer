"use strict";
var cb = require('common-bundle')();
var _ = cb._;

var bunyan = require('bunyan');
var logger = null;
var uuid = require('node-uuid');
var loggingBypassed = false;

function getMsgObject(msg, method) {

    return { 'serverMessage' : msg,
        'serverMethod': method };

}

function buildFinalLogObject(msg, obj, method) {

    return cb.extend(obj, getMsgObject(msg, method));
}

function callLogger(type, msg, obj, method) {

    var final = buildFinalLogObject(msg, obj, method);
    if (logger && !loggingBypassed) logger[type].call(logger, final);
    return final;

}

function initialize(options) {

    options = options || {};
    options = cb.extend(options, getStandardOptions());
    logger = loggingBypassed ? null : bunyan.createLogger(options);
    /* jshint validthis: true */
    return this;

}

function logError(msg, obj, method) {

    obj = cb.extend(obj, {'errorRef' : uuid.v4()});
    return callLogger('error', msg, obj, method);

}

function logWarning(msg, obj, method) {

    obj = cb.extend(obj, {'errorRef' : uuid.v4()});
    return callLogger('warn', msg, obj, method);

}

function logInfo(msg, obj, method) {

    return callLogger('info', msg, obj, method);

}

function logDebug(msg, obj, method) {

    return callLogger('debug', msg, obj, method);

}

function logTrace(msg, obj, method) {

    return callLogger('trace', msg, obj, method);

}


function getStandardOptions() {

    return {
        name: cb.config.applicationName,
        streams: [
            {
                stream: process.stdout,
                level: 'debug'
            },
            {
                path: cb.rootPath + cb.config.logName,
                level: 'trace'
            }
        ]
    };
}

function bypassLogging(shouldBypass) {

    loggingBypassed = shouldBypass;

}

module.exports = {
    initialize: initialize,
    logError: logError,
    logWarning: logWarning,
    logDebug: logDebug,
    logInfo: logInfo,
    logTrace: logTrace,
    getStandardOptions: getStandardOptions,
    bypassLogging: bypassLogging
};
