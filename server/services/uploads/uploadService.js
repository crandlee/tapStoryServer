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
        .then(_.partialRight(transformFileGroupsViewModel, options))
        .then(writeSvc.verifyFileGroups)
        .fail(errSvc.promiseError("Could not get file groups",
            { userName: userName } ));

}

function transformFileGroupsViewModel(userFileGroups, options) {

    return promise(_.map(userFileGroups, function(userFileGroup) {
        return userFileGroup.parent().viewModel('fileGroup', options.apiPath, {doc :userFileGroup } );
    }));

}

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
            return userSvc.addFiles(userName, fileArr, groupId, groupName, options);
        });

}

function removeFileGroup(userName, groupId, options) {

    options = options || {};
    return userSvc.removeFileGroup(userName, groupId, options)
        .then(_.partial(writeSvc.removeFileGroup, groupId))
        .fail(errSvc.promiseError("Could not remove file group",
            { userName: userName, groupId: groupId } ));
}

function removeFile(userName, groupId, fileName, options) {

    options = options || {};
    return userSvc.removeFile(userName, fileName, groupId, options)
        .then(_.partial(writeSvc.removeFile, groupId, fileName))
        .fail(errSvc.promiseError("Could not remove file",
            { userName: userName, fileName: fileName } ));

}

function downloadFiles(currentUser, groupId, fileName, callbackForData) {

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

    var routeDownloadsToArchiver = function(files, groupId) {

        if (files && Array.isArray(files)) {
            return promise.all(_.map(files, function (file) {
                return promise.fcall(writeSvc.downloadFile, file.fileName, groupId);
            })).then(function (streamArr) {
                return promise.fcall(archiveStreams, streamArr);
            });
        } else {
            throw new Error('No files available to route to archiver');
        }

    };

    return userSvc.getPermittedFiles(currentUser, groupId, fileName)
        .then(_.partialRight(routeDownloadsToArchiver, groupId))
        .fail(errSvc.promiseError("Could not download files",
            { userName: currentUser.userName, groupId: groupId, files: fileName } ));

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
    _setWriteService: _setWriteService,
    _setUserService: _setUserService,
    _setFs: _setFs

};
