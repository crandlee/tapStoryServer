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
                res.header('Location', config.baseUri + '/users/' + encodeURIComponent(req.params.userName) + '/fileGroups');
                res.status(302);
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
        res.end(getUploadsHtml(req.params.userName, config.baseUri));
    }
    return next();

}

function getFileGroups(req, res, next) {

    if (!req.params || !req.params.userName) {
        res.status(400);
        res.end();
        return next();
    } else {
        uploads.getFileGroups(req.params.userName)
            .then(function(fileGroups) {
                res.send(200, fileGroups);
            })
            .fail(function(err) {
                res.status(500);
                res.end(err.message);
            })
            .done(function() {
                return next();
            });
    }


}

var getUploadsHtml = function(userName, baseUri) {
    return '<html><head></head><body>' +
        '<form method="POST" action="' + baseUri + '/users/' + encodeURIComponent(userName) + '/files" enctype="multipart/form-data">' +
        '<input type="text" name="textField"><br/>' +
        '<input type="file" name="fileField"><br/>' +
        '<input type="file" name="fileField2"><br/>' +
        '<input type="file" name="fileField3"><br/>' +
        '<input type="file" name="fileField4"><br/>' +
        '<input type="file" name="fileField5"><br/>' +
        '<input type="file" name="fileField6"><br/>' +
        '<input type="file" name="fileField7"><br/>' +
        '<input type="file" name="fileField8"><br/>' +
        '<input type="file" name="fileField9"><br/>' +
        '<input type="file" name="fileField10"><br/>' +
        '<input type="submit">' +
        '</form>' +
        '</body></html>';
};

function _setUploadsService(service) {
    uploads = service;
}

module.exports = {
    upload: upload,
    getUploadsScreen: getUploadsScreen,
    getUploadsHtml: getUploadsHtml,
    getFileGroups: getFileGroups,
    _setUploadsService: _setUploadsService
};