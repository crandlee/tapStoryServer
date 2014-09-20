"use strict";
var cb = require('common-bundle')();
var _ = cb._;
var enums = cb.rootRequire('enums');
var errSvc = cb.errSvc;

function sendStatusAndData(res, status, data) {

    if (res && res.status && typeof res.status === 'function') {
        if (typeof data === 'object' && res.send && typeof res.send === 'function') {
            res.send(status, data);
        } else {
            res.status(status); res.end(data);
        }
    }
}

module.exports = {

    setBadRequest: function(res, data) {
        sendStatusAndData(res, enums.httpStatusCodes.badRequest, data);
    },
    setOk: function(res, data) {
        sendStatusAndData(res, enums.httpStatusCodes.ok, data);
    },
    setUnauthorized: function(res, data) {
        sendStatusAndData(res, enums.httpStatusCodes.unauthorized, data);
    },
    setForbidden: function(res, data) {
        sendStatusAndData(res, enums.httpStatusCodes.forbidden, data);
    },
    setNotFound: function(res, data) {
        sendStatusAndData(res, enums.httpStatusCodes.notFound, data);
    },
    setInternalError: function(res, data, next) {
        var msg = (data && data.message || data);
        errSvc.logError(msg);
        sendStatusAndData(res, enums.httpStatusCodes.internalError, msg);
        if (next && _.isFunction(next)) next(false);
    },
    setCreated: function(res, data) {
        sendStatusAndData(res, enums.httpStatusCodes.created, data);
    }

};