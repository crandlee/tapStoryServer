"use strict";
var cb = require('common-bundle')();
var _ = cb._;
var uploads =  cb.rootRequire('svc-uploads');
var linkSvc = cb.rootRequire('svc-link');
var Encoder = require('node-html-encoder').Encoder;
var ctrlHelper = cb.rootRequire('ctrl-helper');
var userRelSvc = cb.rootRequire('svc-rel');

function upload(req, res, next) {

    var groupName = (req.body && req.body.groupName);
    var userName = (req.params && req.params.userName);
    var groupId = (req.params && req.params.groupId);
    if (!userName) ctrlHelper.setBadRequest('Uploading a file requires a userName');
    if (!groupId && !groupName)
        ctrlHelper.setBadRequest('Uploading a file/files requires either a groupName or a groupId');
    if (userName && (groupId || groupName)) {
        return uploads.uploadFiles(groupName, req.files, { userName: userName, groupId: groupId })
            .then(_.partial(ctrlHelper.setOk, res))
            .fail(_.partial(ctrlHelper.setInternalError, res))
            .fin(next)
            .done();
    } else {
        return next();
    }
}

function getUploadsScreen(req, res, next) {

    var userName = (req.params && req.params.userName);
    var fileGroup = (req.params && req.params.groupId);
    var multiple = !fileGroup;

    if (!userName) {
        ctrlHelper.setBadRequest('The fileHelper requires a userName');
        return next();
    } else {
        ctrlHelper.setOk(res, getUploadsHtml(userName, cb.config.baseUri, multiple, fileGroup));
    }



}


function getFileGroups(req, res, next) {

    var userName = (req.params && req.params.userName);
    var groupId = (req.params && req.params.groupId);
    var apiPath = req.path();

    if (!userName)  {
        ctrlHelper.setBadRequest(res, 'Getting fileGroups requires a userName');
        return next();
    } else {
        
        uploads.getFileGroups(userName, { groupId: groupId, apiPath: apiPath })
            .then(function(fileGroups) {
                var fgWrapper =  { fileGroups: fileGroups } ;
                fgWrapper.fileGroups = fgWrapper.fileGroups.map(_.partial(getFileGroupTopLevelLinks, groupId, apiPath));
                if (!groupId) {
                    fgWrapper = linkSvc.attachLinksToObject(fgWrapper, [
                        { uri: '', method: "DELETE", rel: "fileGroup"}
                    ], req.path());
                }
                ctrlHelper.setOk(res, fgWrapper)
            })
            .fail(_.partial(ctrlHelper.setInternalError, res))
            .fin(next)
            .done();
        
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
    if (!userName) ctrlHelper.setBadRequest(res, 'Removing a fileGroup requires a userName');
    if (!groupId) ctrlHelper.setBadRequest(res, 'Removing a fileGroup requires a groupId');

    if (userName && groupId) {
        uploads.removeFileGroup(userName, groupId, options)
            .then(_.partial(ctrlHelper.setOk, res))
            .fail(_.partial(ctrlHelper.setInternalError, res))
            .fin(next)
            .done();
    } else {
        return next();
    }

}

function removeFile(req, res, next) {

    var userName = (req.params && req.params.userName);
    var groupId = (req.params && req.params.groupId);
    var fileName = (req.body && req.body.fileName);
    if (!userName) ctrlHelper.setBadRequest(res, 'Removing a file requires a userName');
    if (!groupId) ctrlHelper.setBadRequest(res, 'Removing a file requires a groupId');
    if (!fileName) ctrlHelper.setBadRequest(res, 'Removing a file requires a fileName');

    if (userName && groupId && fileName) {
        uploads.removeFile(userName, groupId, fileName)
            .then(_.partial(ctrlHelper.setOk, res))
            .fail(_.partial(ctrlHelper.setInternalError, res))
            .fin(next)
            .done();
    } else {
        return next();
    }

}

function shareFileGroup(req, res, next) {

    var userName = (req.params && req.params.userName);
    var groupId = (req.params && req.params.groupId);
    var shareUser = (req.params && req.params.relUser);
    if (!userName) ctrlHelper.setBadRequest(res, 'Sharing a file group requires a source user name');
    if (!groupId) ctrlHelper.setBadRequest(res, 'Sharing a file group requires a groupId');
    if (!shareUser) ctrlHelper.setBadRequest(res, 'Sharing a file group requires a target user name');

    if (userName && groupId && shareUser) {
        userRelSvc.isRelated(null, userName, shareUser)
            .then(function(isRelated) {
                if (!isRelated) {
                    ctrlHelper.setForbidden(res, 'User must have existing relationship to participate in sharing');
                    next();
                }
                else {
                    uploads.shareFileGroup(userName, groupId, shareUser)
                        .then(_.partial(ctrlHelper.setOk, res))
                        .fail(_.partial(ctrlHelper.setInternalError, res))
                        .fin(next)
                        .done();
                }
            });
    } else {
        return next();
    }

}

function unshareFileGroup(req, res, next) {

    var userName = (req.params && req.params.userName);
    var groupId = (req.params && req.params.groupId);
    var shareUser = (req.params && req.params.relUser);
    if (!userName) ctrlHelper.setBadRequest(res, 'Unsharing a file group requires a source user name');
    if (!groupId) ctrlHelper.setBadRequest(res, 'Unsharing a file group requires a groupId');
    if (!shareUser) ctrlHelper.setBadRequest(res, 'Unsharing a file group requires a target user name');

    if (userName && groupId && shareUser) {
        uploads.unshareFileGroup(userName, groupId, shareUser)
            .then(_.partial(ctrlHelper.setOk, res))
            .fail(_.partial(ctrlHelper.setInternalError, res))
            .fin(next)
            .done();
    } else {
        return next();
    }

}

function getSharesFileGroup(req, res, next) {

    var userName = (req.params && req.params.userName);
    var groupId = (req.params && req.params.groupId);
    if (!userName) ctrlHelper.setBadRequest(res, 'Viewing shares for a file group requires a source user name');
    if (!groupId) ctrlHelper.setBadRequest(res, 'Viewing shares for a file group requires a groupId');

    if (userName && groupId) {
        uploads.getShares(userName, groupId)
            .then(function (shares) {
                if (shares)
                    ctrlHelper.setOk(res, shares);
                else
                    ctrlHelper.setNotFound(res);

            })
            .fail(_.partial(ctrlHelper.setInternalError, res))
            .fin(next)
            .done();
    } else {
        return next();
    }

}

function getShares(req, res, next) {

    var userName = (req.params && req.params.userName);
    if (!userName) ctrlHelper.setBadRequest(res, 'Viewing shares for a user requires a source user name');

    if (userName) {
        console.log(userName);
        uploads.getShares(userName)
            .then(function (shares) {
                if (shares)
                    ctrlHelper.setOk(res, shares);
                else
                    ctrlHelper.setNotFound(res);

            })
            .fail(_.partial(ctrlHelper.setInternalError, res))
            .fin(next)
            .done();
    } else {
        return next();
    }

}


function getSharedFileGroupForUser(req, res, next) {

    var userName = (req.params && req.params.userName);
    var groupId = (req.params && req.params.groupId);
    var shareUser = (req.params && req.params.relUser);

    if (!userName) ctrlHelper.setBadRequest(res, 'Viewing shares for a file group requires a source user name');
    if (!groupId) ctrlHelper.setBadRequest(res, 'Viewing shares for a file group requires a groupId');
    if (!shareUser) ctrlHelper.setBadRequest(res, 'Viewing shares for a file group requires a target user');

    if (userName && groupId && shareUser) {
        userRelSvc.isRelated(null, userName, shareUser)
            .then(function(isRelated) {
                if (!isRelated) {
                    ctrlHelper.setForbidden(res, 'User must have existing relationship to participate in sharing');
                    next();
                } else {
                    uploads.getShares(userName, groupId, shareUser)
                        .then(function (shares) {
                            if (shares)
                                ctrlHelper.setOk(res, shares);
                            else
                                ctrlHelper.setNotFound(res);

                        })
                        .fail(_.partial(ctrlHelper.setInternalError, res))
                        .fin(next)
                        .done();
                }
            });
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
    if (!userName) ctrlHelper.setBadRequest(res, 'Downloading requires a userName');
    if (!groupId) ctrlHelper.setBadRequest(res, 'Downloading requires a groupId');
    if (!currentUser) ctrlHelper.setBadRequest(res, 'Downloading requires a currently logged in user');

    if (userName && groupId && currentUser) {
        uploads.downloadFiles(currentUser, groupId, fileName, sendDownload)
            .fail(_.partial(ctrlHelper.setInternalError, res))
            .fin(next)
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
    getSharesFileGroup: getSharesFileGroup,
    getShares: getShares,
    shareFileGroup: shareFileGroup,
    getSharedFileGroupForUser: getSharedFileGroupForUser,
    unshareFileGroup: unshareFileGroup,
    _setUploadsService: _setUploadsService
};