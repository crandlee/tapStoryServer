"use strict";
require('require-enhanced')();

var bunyan = require('bunyan');
var extend = require('extend');
var logger = null;
var sourceModule = null;

function getMsgObject(msg, method) {

    return { 'serverModule': sourceModule,
        'serverMessage' : msg,
        'serverMethod': method };

}

function buildFinalLogObject(msg, obj, method) {

    return extend(obj, getMsgObject(msg, method));
}

function callLogger(type, msg, obj, method) {

    var final = buildFinalLogObject(msg, obj, method);
    if (logger) logger[type].call(logger, final);
    return final;

}

function initialize(options, source) {

    sourceModule = source;
    if (!options) options = getStandardOptions();
    logger = bunyan.createLogger(options);
    /* jshint validthis: true */
    return this;

}

function logError(msg, obj, method) {

    return callLogger('error', msg, obj, method);

}

function logWarning(msg, obj, method) {

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
        name: 'tapStoryServer',
        streams: [
            {
                stream: process.stdout,
                level: 'debug'
            },
            {
                path: 'tapStoryServer.log',
                level: 'trace'
            }
        ]
    };
}


module.exports = {
    initialize: initialize,
    logError: logError,
    logWarning: logWarning,
    logDebug: logDebug,
    logInfo: logInfo,
    logTrace: logTrace,
    getStandardOptions: getStandardOptions
};
