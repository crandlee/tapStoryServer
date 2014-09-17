"use strict";
var cb = require('common-bundle')();
var _ = cb._;
var enums = cb.rootRequire('enums');

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
    setInternalError: function(res, data) {
        var msg = (data && data.message || data);
        sendStatusAndData(res, enums.httpStatusCodes.internalError, msg);
    },
    setCreated: function(res, data) {
        sendStatusAndData(res, enums.httpStatusCodes.created, data);
    }

};