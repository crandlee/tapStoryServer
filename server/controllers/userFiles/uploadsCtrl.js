"use strict";
var cb = require('common-bundle')();
var _ = cb._;
var uploads =  cb.rootRequire('svc-uploads');
var Encoder = require('node-html-encoder').Encoder;
var ctrlHelper = cb.rootRequire('ctrl-helper');
var userRelSvc = cb.rootRequire('svc-rel');

function upload(req, res, next) {

    return uploads.uploadFiles((req.body && req.body.groupName),
        req.files, { userName: req.params.userName, groupId: req.params.groupId })
            .then(_.partial(ctrlHelper.setOk, res, next))
            .fail(_.partial(ctrlHelper.setInternalError, res, next))
            .done();
}

function getUploadsScreen(req, res, next) {

    var multiple = !(req.params && req.params.groupId);
    ctrlHelper.setOk(res, next, getUploadsHtml(req.params.userName, cb.config.baseUri, multiple, req.params.groupId));

}


function getFileGroups(req, res, next) {

    uploads.getFileGroups(req.params.userName, { groupId: req.params.groupId })
        .then(function(fileGroups) {
            ctrlHelper.setOk(res, next, fileGroups)
        })
        .fail(_.partial(ctrlHelper.setInternalError, res, next))
        .done();

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

    uploads.removeFileGroup(req.params.userName, req.body.groupId, {})
        .then(_.partial(ctrlHelper.setOk, res, next))
        .fail(_.partial(ctrlHelper.setInternalError, res, next))
        .done();

}

function removeFile(req, res, next) {

    uploads.removeFile(req.params.userName, req.params.groupId, req.body.fileName)
        .then(_.partial(ctrlHelper.setOk, res, next))
        .fail(_.partial(ctrlHelper.setInternalError, res, next))
        .done();

}

function shareFileGroup(req, res, next) {

    userRelSvc.isRelated(null, req.params.userName, req.params.relUser)
        .then(function(isRelated) {
            if (!isRelated) {
                ctrlHelper.setForbidden(res, next, 'User must have existing relationship to participate in sharing');
            }
            else {
                uploads.shareFileGroup(req.params.userName, req.params.groupId, req.params.relUser)
                    .then(_.partial(ctrlHelper.setOk, res, next))
                    .fail(_.partial(ctrlHelper.setInternalError, res, next))
                    .done();
            }
        });

}

function unshareFileGroup(req, res, next) {

    uploads.unshareFileGroup(req.params.userName, req.params.groupId, req.params.relUser)
        .then(_.partial(ctrlHelper.setOk, res, next))
        .fail(_.partial(ctrlHelper.setInternalError, res, next))
        .done();
}

function getSharesFileGroup(req, res, next) {

    uploads.getShares(req.params.userName, req.params.groupId, null, req.user.userName)
        .then(function (shares) {
            if (shares)
                ctrlHelper.setOk(res, next, shares);
            else
                ctrlHelper.setNotFound(res, next);

        })
        .fail(_.partial(ctrlHelper.setInternalError, res, next))
        .done();

}

function getShares(req, res, next) {

    uploads.getShares(req.params.userName, null, null, req.user.userName)
        .then(function (shares) {
            if (shares)
                ctrlHelper.setOk(res, next, shares);
            else
                ctrlHelper.setNotFound(res, next);

        })
        .fail(_.partial(ctrlHelper.setInternalError, res, next))
        .done();
}


function getSharedFileGroupForUser(req, res, next) {

    userRelSvc.isRelated(null, req.params.userName, req.params.relUser)
        .then(function(isRelated) {
            if (!isRelated) {
                ctrlHelper.setForbidden(res, next, 'User must have existing relationship to participate in sharing');
            } else {
                uploads.getShares(req.params.userName, req.params.groupId, req.params.relUser, req.user.userName)
                    .then(function (shares) {
                        if (shares)
                            ctrlHelper.setOk(res, next, shares);
                        else
                            ctrlHelper.setNotFound(res, next);

                    })
                    .fail(_.partial(ctrlHelper.setInternalError, res, next))
                    .done();
            }
        });

}

function downloadFiles(req, res, next) {

    var sendDownload = function(data) {
        res.setHeader('Content-disposition', 'attachment; filename=' + req.params.groupId + '.zip');
        res.setHeader('Content-type', 'application/zip');
        res.write(data);
        res.end();
    };

    uploads.downloadFiles(req.params.userName, req.params.groupId, req.params.fileName, sendDownload)
        .fail(_.partial(ctrlHelper.setInternalError, res, next))
        .done();

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