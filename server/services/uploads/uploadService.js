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
        .then(userFileGroupsToArray)
        .then(writeSvc.verifyFileGroups)
        .fail(global.errSvc.promiseError("Could not get file groups",
            { userName: userName } ));

}

function userFileGroupsToArray(userFileGroups) {

    return global.Promise(global._.map(userFileGroups, function(userFileGroup) {
        return userFileGroup.groupId;
    }));

}

function uploadFiles(filesFromRequest, options) {

    //Set up info needed for user saving
    var userName = (options && options.userName) || null;
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
            var fileName = filesFromRequest[fieldName].name;
            var filePath = filesFromRequest[fieldName].path;
            if (fileName && filePath)
                promiseArr.push(global.Promise.fcall(processFile,
                    filePath, fileName, groupId));
        }
    }
    return global.Promise.all(promiseArr)
        .then(function(fileArr) {
            return userSvc.addFiles(userName, fileArr, groupId, {});
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
