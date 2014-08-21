'use strict';
require('require-enhanced')();

var fs = require('fs');
var errSvc = global.rootRequire('svc-error')(null, 'fsWriteService');
var promiseSvc = global.rootRequire('svc-promise');
var config = global.rootRequire('cfg-config')[process.env.NODE_ENV || 'development'];
var mkdirp = require('mkdirp');

function finalizeFile(destPath, data, pid) {

    fs.writeFile(destPath, data, function (err) {
        if (err) {
            errSvc.errorFromPromise(pid, { error: err, path: destPath}
                , "Could not write upload file to file system");
        } else {
            promiseSvc.resolve("OK", pid);
        }
    });
}

function writeFile(destFile, data, options) {

    var pid = (options && options.promiseId) || null;
    var createOwnPid = (!pid);
    if (!pid) {
        pid = promiseSvc.createPromise()
    }
    var optionalDir = options.dirName || '';
    var destPath = config.uploadPath + destFile;

    //Handle optional subfolder under upload folder
    if (optionalDir) {
        var projectedPath = config.uploadPath + optionalDir;
        mkdirp(projectedPath, function (err) {
            if (err) {
                errSvc.errorFromPromise(pid, { error: err, path: projectedPath}
                    , "Could not create the specified upload directory");
            } else {
                finalizeFile(projectedPath + '/' + destFile, data, pid);
            }
        });
    } else {
        finalizeFile(destPath, data, pid);
    }

    return createOwnPid ? promiseSvc.getPromise(pid) : null;

}

module.exports = {
    writeFile: writeFile
};