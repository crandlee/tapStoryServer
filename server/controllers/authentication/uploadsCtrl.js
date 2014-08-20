"use strict";
require('require-enhanced')();

var userSvc = global.rootRequire('svc-user');
var errSvc = global.rootRequire('svc-error')(null, "uploadsController");
var _ = require('lodash');
var linkSvc = global.rootRequire('svc-link');
var promiseSvc = global.rootRequire('svc-promise');


var uploads =  global.rootRequire('svc-uploads');

function upload(req, res, next) {

    uploads.uploadFiles(req.files)
        .then(
        function() { res.send(200); },
        function(err) { res.send(500, err); }
    )
    .fin( function() { return next(); })
    .done();

}

function getUploadsScreen(req, res, next) {

    res.end('<html><head></head><body>' +
        '<form method="POST" enctype="multipart/form-data">' +
        '<input type="text" name="textField"><br/>' +
        '<input type="file" name="fileField"><br/>' +
        '<input type="file" name="fileField2"><br/>' +
        '<input type="submit">' +
        '</form>' +
        '</body></html>');
    return next();

}

module.exports = {
    upload: upload,
    getUploadsScreen: getUploadsScreen
};