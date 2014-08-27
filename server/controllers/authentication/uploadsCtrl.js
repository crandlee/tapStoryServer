"use strict";
require('require-enhanced')();

var uploads =  global.rootRequire('svc-uploads');
var config = global.rootRequire('cfg-config')[process.env.NODE_ENV || 'development'];
var linkSvc = global.rootRequire('svc-link');

function upload(req, res, next) {

    var groupName = (req.body && req.body.groupName);
    var userName = (req.params && req.params.userName);
    var groupId = (req.params && req.params.groupId);
    if (userName) {
        uploads.uploadFiles(groupName, req.files, { userName: userName, groupId: groupId })
            .then(function (groups) {
                res.send(200, groups);
            })
            .fail(function (err) {
                res.status(500);
                res.end(err.message);
            })
            .fin(next)
            .done();
    } else {
        res.status(400);
        res.end();
        next();

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

    var userName = (req.params && req.params.userName);
    var groupId = (req.params && req.params.groupId);
    var path = req.path();
    if (userName) {
        uploads.getFileGroups(userName, { groupId: groupId })
            .then(function(fileGroups) {
                res.send(200, global._.map(fileGroups, function(fileGroup) {
                    return linkSvc.attachLinksToObject(fileGroup,
                        [ { uri: groupId ? '' : '/' + fileGroup.groupId , rel: 'fileGroup', isSelf: !groupId }]
                    , path);
                }));
            })
            .fail(function(err) {
                res.status(500);
                res.end(err.message);
            })
            .done(function() {
                return next();
            });
    } else {
        res.status(400);
        res.end();
        return next();
    }


}


var getUploadsHtml = function(userName, baseUri) {
    return '<html><head></head><body>' +
        '<form method="POST" action="' + baseUri + '/users/' + encodeURIComponent(userName) + '/fileGroups" enctype="multipart/form-data">' +
        '<input type="text" name="groupName"><br/>' +
        '<input type="text" name="groupId"><br/>' +
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