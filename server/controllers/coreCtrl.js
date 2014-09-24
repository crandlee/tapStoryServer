"use strict";
var cb = require('common-bundle')();
var _ = cb._;
var errSvc = cb.errSvc;
var ctrlHelper = cb.rootRequire('ctrl-helper');

function core(req, res, next) {

    ctrlHelper.setOk(res, next, {});

}

module.exports = {
    core: core
};