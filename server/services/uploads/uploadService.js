'use strict';
require('require-enhanced')();

var fs = require('fs');
var errSvc = global.rootRequire('svc-error')(null, "");
var promiseSvc = global.rootRequire('svc-promise');
var fsWriteSvc = global.rootRequire('svc-fswrite');

function uploadFiles(filesFromRequest) {

    //TODO-Randy - needs test
    var pid = promiseSvc.createPromise();

    for (var fieldName in filesFromRequest) {
        if (filesFromRequest.hasOwnProperty(fieldName)) {
            //NOTE: The following section needed a functional closure because
            //of the async readFile which needed snapshots of the values in each
            //iteration of the loop
            (function (fp, fn) {
                fs.readFile(fp, function (err, data) {
                    if (err) {
                        var errMsg = "Could not read file from upload path " + fp;
                        errSvc.buildAndLogError({ error: err }, errMsg);
                        promiseSvc.reject(errMsg, pid);
                    } else {
                        var test = global.rootRequire('util-test');
                        fsWriteSvc.writeFile(fn, data, { promiseId: pid, dirName: test.getRandomString(10) });
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
