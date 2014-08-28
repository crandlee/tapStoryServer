"use strict";
require('require-enhanced')();

var uploads =  global.rootRequire('svc-uploads');
var config = global.rootRequire('cfg-config')[process.env.NODE_ENV || 'development'];
var linkSvc = global.rootRequire('svc-link');
var Encoder = require('node-html-encoder').Encoder;



function upload(req, res, next) {

    var groupName = (req.body && req.body.groupName);
    var userName = (req.params && req.params.userName);
    var groupId = (req.params && req.params.groupId);
    if (userName) {
        uploads.uploadFiles(groupName, req.files, { userName: userName, groupId: groupId })
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
    } else {
        res.status(400);
        res.end();
        next();
    }
}

function getUploadsScreen(req, res, next) {

    var userName = (req.params && req.params.userName);
    var fileGroup = (req.params && req.params.groupId);
    var multiple = !fileGroup;

    if (userName) {
        res.end(getUploadsHtml(userName, config.baseUri, multiple, fileGroup));
    } else {
        res.status(400);
        res.end();

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
                    var linkSetupArr = [];
                    if (groupId)
                        linkSetupArr.push({ uri: '/fileHelper' , rel: 'fileHelper' });
                    else {
                        linkSetupArr.push({ uri: '/' + fileGroup.groupId , rel: 'fileGroup', isSelf:true });
                        linkSetupArr.push({ uri: '/' + fileGroup.groupId , rel: 'fileGroup', method: 'POST' });
                        linkSetupArr.push({ uri: '/' + fileGroup.groupId , rel: 'fileGroup', method: 'DELETE' });
                    }
                    return linkSvc.attachLinksToObject(fileGroup, linkSetupArr, path);
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


var getUploadsHtml = function(userName, baseUri, multiple, fileGroup) {

    var encoder = new Encoder('entity');
    multiple = multiple || false;
    fileGroup = fileGroup || '';
    var html = '<html><head></head><body>' +
        '<form method="POST" action="' + baseUri + '/users/' + encodeURIComponent(userName) + '/fileGroups" enctype="multipart/form-data">' +
        '<input type="text" name="groupName"><br/>' +
        '<input type="text" name="groupId" value="' + encoder.htmlEncode(fileGroup) + '"><br/>' +
        '<input type="file" name="fileField"><br/>';
        if (multiple) {
            html += '<input type="file" name="fileField2"><br/>' +
                '<input type="file" name="fileField3"><br/>' +
                '<input type="file" name="fileField4"><br/>' +
                '<input type="file" name="fileField5"><br/>' +
                '<input type="file" name="fileField6"><br/>' +
                '<input type="file" name="fileField7"><br/>' +
                '<input type="file" name="fileField8"><br/>' +
                '<input type="file" name="fileField9"><br/>' +
                '<input type="file" name="fileField10"><br/>';

        }
        html += '<input type="submit">' +
        '</form>' +
        '</body></html>';
        return html;
};

function removeFileGroup(req, res, next) {

    var userName = (req.params && req.params.userName);
    var groupId = (req.body && req.body.groupId);
    var options = {};
    if (userName && groupId) {
        uploads.removeFileGroup(userName, groupId, options)
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
    } else {
        res.status(400);
        res.end(!groupId ? 'Must include a groupId in the body' : '');
        next();
    }

}

function removeFile(req, res, next) {

    var userName = (req.params && req.params.userName);
    var groupId = (req.params && req.params.groupId);
    var fileName = (req.body && req.body.fileName);
    if (userName && groupId && fileName) {
        uploads.removeFile(userName, groupId, fileName)
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
        res.end(!fileName ? 'Must include a fileName in the body' : '');
        next();
    }

}

function _setUploadsService(service) {
    uploads = service;
}

module.exports = {
    upload: upload,
    getUploadsScreen: getUploadsScreen,
    getUploadsHtml: getUploadsHtml,
    getFileGroups: getFileGroups,
    removeFileGroup: removeFileGroup,
    removeFile: removeFile,
    _setUploadsService: _setUploadsService
};