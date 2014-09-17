"use strict";
var cb = require('common-bundle')();
var _ = cb._;
var errSvc = cb.errSvc;
var linkSvc = cb.rootRequire('svc-link');
var ctrlHelper = cb.rootRequire('ctrl-helper');

function core(req, res, next) {

    //Add top level hypermedia
    var obj = linkSvc.attachLinksToObject({}, [
        { uri: '/users', rel: 'users'}
    ], req.path());
    ctrlHelper.setOk(res, obj);

    return next();

}

module.exports = {
    core: core
};