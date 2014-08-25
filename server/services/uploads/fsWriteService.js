'use strict';
require('require-enhanced')();

var fs = require('fs');
var mkdirp = require('mkdirp');

function finalizeFile(destPath, data) {

    return global.Promise.denodeify(fs.writeFile)(destPath, data)
        .fail(global.errSvc.promiseError("Could not write upload file to file system",
            { path: destPath }));

}

function writeFile(destFile, data, options) {

    var optionalDir = options.dirName || '';
    var destPath = global.config.uploadPath + destFile;

    //Handle optional subfolder under upload folder
    if (optionalDir) {
        var projectedPath = global.config.uploadPath + optionalDir;
        return global.Promise.denodeify(mkdirp)(projectedPath)
            .then(function() {
                return finalizeFile(projectedPath + '/' + destFile, data);
            })
            .fail(global.errSvc.promiseError("Could not create the specified upload directory",
                { path: projectedPath }));
    } else {
        return finalizeFile(destPath, data);
    }

}

module.exports = {
    writeFile: writeFile
};