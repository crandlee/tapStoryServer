"use strict";
require('require-enhanced')();

var uploads =  global.rootRequire('svc-uploads');
var config = global.rootRequire('cfg-config')[process.env.NODE_ENV || 'development'];

function upload(req, res, next) {

    uploads.uploadFiles(req.files, { userName: req.params.userName })
        .then(
            function() { res.send(200); },
            function(err) { res.send(500, err); }
        )
        .fin( function() { return next(); })
        .done();

}

function getUploadsScreen(req, res, next) {

    res.end('<html><head></head><body>' +
        '<form method="POST" action="' + config.baseUri + '/user/' + encodeURIComponent(req.params.userName) + '/upload" enctype="multipart/form-data">' +
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