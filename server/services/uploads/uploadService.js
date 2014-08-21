'use strict';
require('require-enhanced')();

var fs = require('fs');
var errSvc = global.rootRequire('svc-error')(null, "");
var promiseSvc = global.rootRequire('svc-promise');
var fsWriteSvc = global.rootRequire('svc-fswrite');

function uploadFiles(filesFromRequest, options) {

    //TODO-Randy - needs test
    var pid = promiseSvc.createPromise();

    var userName = (options && options.userName) || null;

    for (var fieldName in filesFromRequest) {
        if (filesFromRequest.hasOwnProperty(fieldName)) {
            //NOTE: The following section needed a functional closure because
            //of the async readFile which needed snapshots of the values in each
            //iteration of the loop
            (function (fp, fn) {
                fs.readFile(fp, function (err, data) {
                    if (err) {
                        if (err) errSvc.errorFromPromise(pid, { error: err, path: fp}
                            , "Could not read uploaded file from temporary folder");
                    } else {
                        fsWriteSvc.writeFile(fn, data, { promiseId: pid, dirName: null });
                    }
                });

            }(filesFromRequest[fieldName].path, filesFromRequest[fieldName].name));

        }
    }

    return promiseSvc.getPromise(pid);

}

module.exports = {
    uploadFiles: uploadFiles
};
