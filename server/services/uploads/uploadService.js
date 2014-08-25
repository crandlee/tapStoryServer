'use strict';
require('require-enhanced')();

var fs = require('fs');
var writeSvc = global.rootRequire('svc-fswrite');
var userSvc = global.rootRequire('svc-user');
var uuid = require('node-uuid');


function uploadFiles(filesFromRequest, options) {

    //TODO-Randy - needs test
    //Set up info needed for user saving
    var userName = (options && options.userName) || null;
    var groupId = uuid.v4();

    var fileOutputComplete = options.fileOutputComplete || function(filePath, fileName, data, groupId) {

        return writeSvc.writeFile(fileName, data, { dirName: groupId })
            .then(function() {
                return userSvc.addFile(userName, fileName, groupId);
            })
            .fail(global.errSvc.promiseError("Could not read uploaded file from temporary folder"),
                { path: filePath, fileName: fileName });
    };

    var processFile = options.processFile || function(filePath, fileName, groupId) {

        if (filePath && fileName) {

            return global.Promise.denodeify(fs.readFile)(filePath)
                .then(global._.partial(fileOutputComplete, filePath, fileName, groupId))
                .fail(global.errSvc.promiseError("Could not read uploaded file from temporary folder",
                        { path: filePath, fileName: fileName } ));

        }

    };

    //Process the files
    for (var fieldName in filesFromRequest) {
        if (filesFromRequest.hasOwnProperty(fieldName)) {
            processFile(filesFromRequest[fieldName].path,
                filesFromRequest[fieldName].name, groupId);
        }
    }

}

function _setWriteService(service) {
    writeSvc = service;
}

function _setUserService(service) {
    userSvc = service;
}

module.exports = {
    uploadFiles: uploadFiles,
    _setWriteService: _setWriteService,
    _setUserService: _setUserService

};
