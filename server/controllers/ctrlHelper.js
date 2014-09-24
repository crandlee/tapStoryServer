"use strict";
var cb = require('common-bundle')();
var _ = cb._;
var enums = cb.rootRequire('enums');
var errSvc = cb.errSvc;

function sendStatusAndData(res, status, data, next) {

    if (res && res.status && _.isFunction(res.status)) {
        if ((status >= 200 && status < 300) || !next || !_.isFunction(next)) {
            res._tempData = data;
            res.status(status);
            next(true);
        } else {
            res.send(status, data);
            next(false);
        }
    }
}


module.exports = {

    setBadRequest: function(res, next, data) {
        sendStatusAndData(res, enums.httpStatusCodes.badRequest, data, next);
    },
    setOk: function(res, next, data) {
        sendStatusAndData(res, enums.httpStatusCodes.ok, data, next);
    },
    setUnauthorized: function(res, next, data) {
        sendStatusAndData(res, enums.httpStatusCodes.unauthorized, data, next);
    },
    setForbidden: function(res, next, data) {
        sendStatusAndData(res, enums.httpStatusCodes.forbidden, data, next);
    },
    setNotFound: function(res, next, data) {
        sendStatusAndData(res, enums.httpStatusCodes.notFound, data, next);
    },
    setInternalError: function(res, next, data) {
        console.log(next);
        var msg = (data && data.message || data);
        errSvc.logError(msg);
        sendStatusAndData(res, enums.httpStatusCodes.internalError, msg, next);
    },
    setCreated: function(res, next, data) {
        sendStatusAndData(res, enums.httpStatusCodes.created, data, next);
    }

};