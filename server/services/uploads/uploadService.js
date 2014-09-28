'use strict';
var cb = require('common-bundle')();
var _ = cb._;
var errSvc = cb.errSvc;
var promise = cb.Promise;

var fs = require('fs');
var writeSvc = cb.rootRequire('svc-fswrite');
var userSvc = cb.rootRequire('svc-user');
var uuid = require('node-uuid');
var archiver = require('archiver');
var concat = require('concat-stream');

function getFileGroups(userName, options) {

    //Get file groups from user object then verify with storage service
    //that file group actually exists.
    return userSvc.getFileGroups(userName, options)
        .then(writeSvc.verifyFileGroups)
        .fail(errSvc.promiseError("Could not get file groups",
            { userName: userName } ));

}

//function transformFileGroupsViewModel(userFileGroups) {
//    return promise(_.map(userFileGroups, function(userFileGroup) {
//        console.log(userFileGroup.parent());
//        return userFileGroup.parent().viewModel('fileGroup', { doc: userFileGroup });
//    }));
//
//}

function uploadFiles(groupName, filesFromRequest, options) {

    //Set up info needed for user saving
    var userName = (options && options.userName) || null;
    if (options.groupId) options.existing = true;
    var groupId = options.groupId || uuid.v4();

    var fileOutputComplete = options.fileOutputComplete || function(filePath, fileName, groupId, data) {

        return writeSvc.writeFile(fileName, data, { dirName: groupId })
            .then(function() {
                return promise(fileName);
            })
            .fail(errSvc.promiseError("Could not complete file output"),
                { path: filePath, fileName: fileName });
    };

    var processFile = options.processFile || function(filePath, fileName, groupId) {

        if (filePath && fileName) {
            return cb.promiseUtils.deNodeify(fs.readFile)(filePath)
                .then(_.partial(fileOutputComplete, filePath, fileName, groupId))
                .fail(errSvc.promiseError("Could not complete file upload process",
                        { path: filePath, fileName: fileName } ));
        }

    };

    //Process the files
    var promiseArr = [];
    for (var fieldName in filesFromRequest) {
        if (filesFromRequest.hasOwnProperty(fieldName)) {
            var field = filesFromRequest[fieldName];
            if (field.name && field.path)
                promiseArr.push(promise.fcall(processFile,
                    field.path, field.name, groupId));
        }
    }
    return promise.all(promiseArr)
        .then(function(fileArr) {
            return userSvc.addFiles(userName, fileArr, groupId, groupName, options)
                .then(function() {
                    return getFileGroups(userName, { groupId: groupId });
                });
        });

}

function removeFileGroup(userName, groupId, options) {

    options = options || {};
    return userSvc.getFileGroups(userName, { groupId: groupId })
        .then(function(fg) {
            if (fg.length === 0) errSvc.error('This file group does not match this user', { groupId: groupId });
            return userSvc.removeFileGroup(userName, groupId, options)
                .then(_.partial(writeSvc.removeFileGroup, groupId))
                .then(function() {
                    return { success: true }
                })
                .fail(errSvc.promiseError("Could not remove file group",
                    { userName: userName, groupId: groupId } ));
        });
}

function removeFile(userName, groupId, fileName, options) {

    options = options || {};
    return userSvc.getFileGroups(userName, { groupId: groupId })
        .then(function(fg) {
            if (fg.length === 0) errSvc.error('This file group does not match this user', { groupId: groupId });
            return userSvc.removeFile(userName, fileName, groupId, options)
                .then(_.partial(writeSvc.removeFile, groupId, fileName))
                .then(function() {
                    return userSvc.getFileGroups(userName, { groupId: groupId });
                })
                .fail(errSvc.promiseError("Could not remove file",
                    { userName: userName, fileName: fileName }));
        });
}

function downloadFiles(userName, groupId, fileName, callbackForData) {

    var archiveStreams = function (streamContainerArr) {

        var archive = archiver('zip');
        var writer = concat(callbackForData);

        if (streamContainerArr && Array.isArray(streamContainerArr)) {

            archive.pipe(writer);

            streamContainerArr.forEach(function (s) {
                archive.append(s.stream, { name: s.name });
            });
            archive.finalize();

        }

    };

    var routeDownloadsToArchiver = function(fg, groupId, fileName) {

        var files = fg[0].files;
        if (files && Array.isArray(files)) {
            return promise.all(_(files)
                .filter(function(file) { return (!fileName) || file.fileName === fileName; })
                .map(function (file) {
                    return promise.fcall(writeSvc.downloadFile, file.fileName, groupId);
                }).value()
            ).then(function (streamArr) {
                return promise.fcall(archiveStreams, streamArr);
            });
        } else {
            throw new Error('No files available to route to archiver');
        }

    };

    return userSvc.getFileGroups(userName, { groupId: groupId })
        .then(_.partialRight(routeDownloadsToArchiver, groupId, fileName))
        .fail(errSvc.promiseError("Could not download files",
            { userName: userName.userName, groupId: groupId, files: fileName } ));

}

function shareFileGroup(userName, groupId, targetUser) {

    return userSvc.addFileGroupShare(userName, groupId, targetUser)
        .then(function() {
            return { success: true };
        });

}

function unshareFileGroup(userName, groupId, targetUser) {

    return userSvc.removeFileGroupShare(userName, groupId, targetUser)
        .then(function() {
            return { success: true };
        });

}

function getShares(userName, groupId, sharedUser, currentUser) {

    return userSvc.getShares(userName, groupId, sharedUser, currentUser);

}


function _setWriteService(service) {
    writeSvc = service;
}

function _setUserService(service) {
    userSvc = service;
}

function _setFs(stub) {
    fs = stub;
}


module.exports = {
    uploadFiles: uploadFiles,
    getFileGroups: getFileGroups,
    removeFileGroup: removeFileGroup,
    removeFile: removeFile,
    downloadFiles: downloadFiles,
    shareFileGroup: shareFileGroup,
    unshareFileGroup: unshareFileGroup,
    getShares: getShares,
    _setWriteService: _setWriteService,
    _setUserService: _setUserService,
    _setFs: _setFs

};
