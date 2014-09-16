"use strict";
var cb = require('common-bundle')();
var _ = cb._;
var uploads =  cb.rootRequire('svc-uploads');
var linkSvc = cb.rootRequire('svc-link');
var Encoder = require('node-html-encoder').Encoder;


function upload(req, res, next) {

    var groupName = (req.body && req.body.groupName);
    var userName = (req.params && req.params.userName);
    var groupId = (req.params && req.params.groupId);
    if (!userName) { res.status(400); res.end('Uploading a file requires a userName'); }
    if (!groupId && !groupName) if (!userName) { res.status(400); res.end('Uploading a file/files requires either a groupName or a groupId'); }
    if (userName && (groupId || groupName)) {
        uploads.uploadFiles(groupName, req.files, { userName: userName, groupId: groupId })
            .then(function () {
                res.status(200);
                res.end();
            })
            .fail(function (err) {
                res.status(500);
                res.end(err.message);
            })
            .fin(function() { return next(); })
            .done();
    } else {
        return next();
    }
}

function getUploadsScreen(req, res, next) {

    var userName = (req.params && req.params.userName);
    var fileGroup = (req.params && req.params.groupId);
    var multiple = !fileGroup;

    if (!userName) { res.status(400); res.end('The fileHelper requires a userName'); }

    if (userName) {
        res.end(getUploadsHtml(userName, cb.config.baseUri, multiple, fileGroup));
    } else {
        return next();
    }

}


function getFileGroups(req, res, next) {

    var userName = (req.params && req.params.userName);
    var groupId = (req.params && req.params.groupId);
    var apiPath = req.path();

    if (!userName) { res.status(400); res.end('Getting fileGroups requires a userName'); }

    if (userName) {
        uploads.getFileGroups(userName, { groupId: groupId, apiPath: apiPath })
            .then(function(fileGroups) {
                var obj =  { fileGroups: fileGroups } ;
                obj.fileGroups = obj.fileGroups.map(_.partial(getFileGroupTopLevelLinks, groupId, apiPath));
                if (!groupId) {
                    obj = linkSvc.attachLinksToObject(obj, [
                        { uri: '', method: "DELETE", rel: "fileGroup"}
                    ], req.path());
                }
                res.send(200, obj);
            })
            .fail(function(err) {
                res.status(500);
                res.end(err.message);
            })
            .fin(function() { return next(); })
            .done();
    } else {
        return next();
    }


}

function getFileGroupTopLevelLinks(groupId, apiPath, fileGroup) {

    var linkSetupArr = [];
    if (groupId) {
        //For single file group
        linkSetupArr.push({ uri: '/fileHelper', rel: 'fileHelper' });
        linkSetupArr.push({ uri: '/files', rel: 'filePackage', method: 'GET' });
        linkSetupArr.push({ uri: '/files' , rel: 'file', method: 'POST' });
        linkSetupArr.push({ uri: '/files' , rel: 'file', method: 'DELETE' });
    } else {
        //For multiple file groups
        delete fileGroup.files;  //Do not show files for multiple file groups
        linkSetupArr.push({ uri: '/' + fileGroup.groupId , rel: 'fileGroup', isSelf: true });
    }
    return linkSvc.attachLinksToObject(fileGroup, linkSetupArr, apiPath);

}

var getUploadsHtml = function(userName, baseUri, multiple, fileGroup) {

    var encoder = new Encoder('entity');
    multiple = multiple || false;
    fileGroup = fileGroup || '';
    var html = '<html><head></head><body>';
        if (multiple)
            html += '<form method="POST" action="' + baseUri + '/users/' + encodeURIComponent(userName) + '/fileGroups" enctype="multipart/form-data">';
        else
            html += '<form method="POST" action="' + baseUri + '/users/' + encodeURIComponent(userName) + '/fileGroups/' + encoder.htmlEncode(fileGroup) + '/files" enctype="multipart/form-data">';
        html += '<input type="text" name="groupName"><br/>' +
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
    if (!userName) { res.status(400); res.end('Removing a fileGroup requires a userName'); }
    if (!groupId) { res.status(400); res.end('Removing a fileGroup requires a groupId'); }

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
            .fin(function() { return next(); })
            .done();
    } else {
        return next();
    }

}

function removeFile(req, res, next) {

    var userName = (req.params && req.params.userName);
    var groupId = (req.params && req.params.groupId);
    var fileName = (req.body && req.body.fileName);
    if (!userName) { res.status(400); res.end('Removing a file requires a userName'); }
    if (!groupId) { res.status(400); res.end('Removing a file requires a groupId'); }
    if (!fileName) { res.status(400); res.end('Removing a file requires a fileName'); }

    if (userName && groupId && fileName) {
        uploads.removeFile(userName, groupId, fileName)
            .then(function (groups) {
                res.send(200, groups);
            })
            .fail(function (err) {
                res.status(500);
                res.end(err.message);
            })
            .fin(function() { return next(); })
            .done();
    } else {
        return next();
    }

}


function downloadFiles(req, res, next) {

    var userName = (req.params && req.params.userName);
    var groupId = (req.params && req.params.groupId);
    var fileName = (req.params && req.params.fileName);

    var sendDownload = function(data) {
        res.setHeader('Content-disposition', 'attachment; filename=' + groupId + '.zip');
        res.setHeader('Content-type', 'application/zip');
        res.write(data);
        res.end();
    };
    var currentUser = req.user;
    if (!userName) { res.status(400); res.end('Downloading requires a userName'); }
    if (!groupId) { res.status(400); res.end('Downloading requires a groupId'); }
    if (!currentUser) { res.status(400); res.end('Downloading requires a currently logged in user'); }

    if (userName && groupId && currentUser) {
        uploads.downloadFiles(currentUser, groupId, fileName, sendDownload)
            .fail(function (err) {
                res.status(500);
                res.end(err.message);
            })
            .fin(function() { return next(); })
            .done();
    } else {
        return next();
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
    downloadFiles: downloadFiles,
    _setUploadsService: _setUploadsService
};