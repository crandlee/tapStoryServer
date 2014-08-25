'use strict';
require('require-enhanced')();

var fs = require('fs');
var writeSvc = global.rootRequire('svc-fswrite');
var userSvc = global.rootRequire('svc-user');
var uuid = require('node-uuid');


function uploadFiles(filesFromRequest, options) {

    //Set up info needed for user saving
    var userName = (options && options.userName) || null;
    var groupId = options.groupId || uuid.v4();

    var fileOutputComplete = options.fileOutputComplete || function(filePath, fileName, groupId, data) {

        return writeSvc.writeFile(fileName, data, { dirName: groupId })
            .then(function(ret) {
                return userSvc.addFile(userName, fileName, groupId, {}, ret);
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

        } else {
            global.errSvc.error('Upload requires a valid file path and name',
                { fileName: fileName, filePath: filePath});
        }

    };

    //Process the files
    var promiseArr = [];
    for (var fieldName in filesFromRequest) {
        if (filesFromRequest.hasOwnProperty(fieldName)) {
            promiseArr.push(global.Promise.fcall(processFile,
                filesFromRequest[fieldName].path, filesFromRequest[fieldName].name, groupId));
        }
    }
    return global.Promise.all(promiseArr);

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
    _setWriteService: _setWriteService,
    _setUserService: _setUserService,
    _setFs: _setFs

};
