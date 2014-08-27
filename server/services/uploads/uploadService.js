'use strict';
require('require-enhanced')();

var fs = require('fs');
var writeSvc = global.rootRequire('svc-fswrite');
var userSvc = global.rootRequire('svc-user');
var uuid = require('node-uuid');


function getFileGroups(userName, options) {

    //Get file groups from user object then verify with storage service
    //that file group actually exists.
    return userSvc.getFileGroups(userName, options)
        .then(global._.partialRight(getFileGroupViewModel, options))
        .then(writeSvc.verifyFileGroups)
        .fail(global.errSvc.promiseError("Could not get file groups",
            { userName: userName } ));

}

function getFileGroupViewModel(userFileGroups, options) {

    return global.Promise(global._.map(userFileGroups, function(userFileGroup) {
        var baseGroup = { groupId: userFileGroup.groupId, groupName: userFileGroup.groupName };
        if (options.groupId) {
            baseGroup.files = userFileGroup.files;
        }
        return baseGroup;
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
                return global.Promise(fileName);
            })
            .fail(global.errSvc.promiseError("Could not complete file output"),
                { path: filePath, fileName: fileName });
    };

    var processFile = options.processFile || function(filePath, fileName, groupId) {

        if (filePath && fileName) {
            return global.promiseUtils.deNodeify(fs.readFile)(filePath)
                .then(global._.partial(fileOutputComplete, filePath, fileName, groupId))
                .fail(global.errSvc.promiseError("Could not complete file upload process",
                        { path: filePath, fileName: fileName } ));
        }

    };

    //Process the files
    var promiseArr = [];
    for (var fieldName in filesFromRequest) {
        if (filesFromRequest.hasOwnProperty(fieldName)) {
            var field = filesFromRequest[fieldName];
            if (field.name && field.path)
                promiseArr.push(global.Promise.fcall(processFile,
                    field.path, field.name, groupId));
        }
    }
    return global.Promise.all(promiseArr)
        .then(function(fileArr) {
            return userSvc.addFiles(userName, fileArr, groupId, groupName, options);
        });

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
    _setWriteService: _setWriteService,
    _setUserService: _setUserService,
    _setFs: _setFs

};
