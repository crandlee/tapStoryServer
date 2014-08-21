'use strict';
require('require-enhanced')();

var fs = require('fs');
var errSvc = global.rootRequire('svc-error');
var promiseSvc = global.rootRequire('svc-promise');
var config = global.rootRequire('cfg-config')[process.env.NODE_ENV || 'development'];
var mkdirp = require('mkdirp');

function finalizeFile(destPath, data, pid) {

    fs.writeFile(destPath, data, function (err) {

       try {

           if (err) {
               throw new Error(err);
           } else {
               promiseSvc.resolve("OK", pid);
           }

       } catch(e) {

           errSvc.errorFromPromise(pid, { error: e.toString(), path: destPath}
               , "Could not write upload file to file system", 'fsWriteService.finalizeFile');

       }

    });
}

function writeFile(destFile, data, options) {

    var pid = promiseSvc.createPromise({ externalPromise: (options && options.externalPromise) });
    var optionalDir = options.dirName || '';
    var destPath = config.uploadPath + destFile;

    //Handle optional subfolder under upload folder
    if (optionalDir) {
        var projectedPath = config.uploadPath + optionalDir;
        mkdirp(projectedPath, function (err) {
            try {
                if (err) {
                    throw new Error(err);
                } else {
                    finalizeFile(projectedPath + '/' + destFile, data, pid);
                }

            } catch (e) {
                errSvc.errorFromPromise(pid, { error: e.toString(), path: projectedPath}
                    , "Could not create the specified upload directory", "fsWriteService.writeFile");

            }
        });
    } else {
        finalizeFile(destPath, data, pid);
    }

    return promiseSvc.getPromise(pid, { externalPromise: (options && options.externalPromise) });

}

module.exports = {
    writeFile: writeFile
};