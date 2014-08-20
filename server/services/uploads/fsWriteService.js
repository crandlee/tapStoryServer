'use strict';
require('require-enhanced')();

var fs = require('fs');
var errSvc = global.rootRequire('svc-error')(null, 'fsWriteService');
var promiseSvc = global.rootRequire('svc-promise');
var config = global.rootRequire('cfg-config')[process.env.NODE_ENV || 'development'];

function writeFile(destFile, data, options) {

    var pid = (options && options.promiseId) || null;
    var createOwnPid = (!pid);
    if (!pid) { pid = promiseSvc.createPromise() }
    var optionalDir = options.dirName || '';

    var destPath = config.uploadPath + destFile;
    fs.writeFile(destPath, data, function (err) {
        if (err) {
            var errMsg = "Could not write upload file to path " + destPath;
            errSvc.buildAndLogError({ error: err }, errMsg);
            promiseSvc.reject(errMsg, pid);
        } else {
            promiseSvc.resolve("OK", pid);
        }
    });

    return createOwnPid ? promiseSvc.getPromise(pid) : null;

}


module.exports = {
  writeFile: writeFile
};