"use strict";
require('require-enhanced')();

var uploads =  global.rootRequire('svc-uploads');
var config = global.rootRequire('cfg-config')[process.env.NODE_ENV || 'development'];

function upload(req, res, next) {

    if (!req.params || !req.params.userName) {
        res.status(400);
        res.end();
        next();
    } else {
        uploads.uploadFiles(req.files, { userName: req.params.userName })
            .then(function () {
                res.status(200);
                res.end();
            })
            .fail(function (err) {
                res.status(500);
                res.end(err.message);
            })
            .fin(next)
            .done();
    }
}

function getUploadsScreen(req, res, next) {

    if (!req.params || !req.params.userName) {
        res.status(400);
        res.end();
    } else {
        /* jshint validthis:true */
        res.end(this.getUploadsHtml(req.params.userName, config.baseUri));
    }
    return next();

}

function getUploadsHtml(userName, baseUri) {
    return '<html><head></head><body>' +
        '<form method="POST" action="' + baseUri + '/user/' + encodeURIComponent(userName) + '/upload" enctype="multipart/form-data">' +
        '<input type="text" name="textField"><br/>' +
        '<input type="file" name="fileField"><br/>' +
        '<input type="file" name="fileField2"><br/>' +
        '<input type="submit">' +
        '</form>' +
        '</body></html>';
}

function _setUploadsService(service) {
    uploads = service;
}

module.exports = {
    upload: upload,
    getUploadsScreen: getUploadsScreen,
    getUploadsHtml: getUploadsHtml,
    _setUploadsService: _setUploadsService
};