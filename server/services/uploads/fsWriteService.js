'use strict';
require('require-enhanced')();

var fs = require('fs');
var mkdirp = require('mkdirp');
var rimraf = require('rimraf');
var logSvc = global.rootRequire('svc-logging');


function removeFileGroup(groupId) {

    var destPath = global.config.uploadPath + groupId;
    return global.promiseUtils.deNodeify(rimraf)(destPath)
        .fail(global.errSvc.promiseError("Could not remove file group from system",
            { groupId: groupId }))

}

function removeFile(groupId, fileName) {

    var destPath = global.config.uploadPath + groupId + '/' + fileName;
    return global.promiseUtils.deNodeify(fs.unlink)(destPath)
        .fail(function (err) {
            logSvc.logWarning("An error message was returned trying to remove a file"
                , { error: err, groupId: groupId, fileName: fileName  });
        });

}

function writeFile(destFile, data, options) {

    var finalizeFile = options.finalizeFile || function (destPath, data) {

        return global.promiseUtils.deNodeify(fs.writeFile)(destPath, data)
            .fail(global.errSvc.promiseError("Could not write upload file to file system",
                { path: destPath }));

    };

    var optionalDir = options.dirName || '';
    var destPath = global.config.uploadPath + destFile;

    //Handle optional subfolder under upload folder
    if (optionalDir) {
        var projectedPath = global.config.uploadPath + optionalDir;
        return global.promiseUtils.deNodeify(mkdirp)(projectedPath)
            .then(function (ret) {
                //Sending return value of this to finalizeFile for unit testing results
                //verifying the call to mkdirp.  Not sure of a better way to do this.
                return finalizeFile(projectedPath + '/' + destFile, data, ret);
            })
            .fail(global.errSvc.promiseError("Could not create the specified upload directory",
                { path: projectedPath }));
    } else {
        return finalizeFile(destPath, data);
    }

}

function verifyFileGroups(fileGroups) {

    return global.Promise.all(global._.map(fileGroups, function (fileGroup) {
        return verifyFileGroup(fileGroup)
            .then(verifyFiles);
    }))
        .then(function (fg) {
            //Return only valid
            return global._.chain(fg)
                .filter('valid')
                .map(function (fg) {
                    delete fg.valid;
                    return fg;
                })
                .value();
        })
        .fail(global.errSvc.promiseError("Error verifying file groups",
            { groupIds: global._.map(fileGroups, 'groupId') }));

    //fs.stat(d, function (er, s) { cb(!er && s.isDirectory()) })

}

function verifyFileGroup(fileGroup) {

    function addValidityToFileGroup(valid) {
        if (fileGroup) fileGroup.valid = valid;
        return fileGroup;
    }

    return global.promiseUtils.deNodeify(fs.stat)(global.config.uploadPath + fileGroup.groupId)
        .then(function (stat) {
            return addValidityToFileGroup(stat && stat.isDirectory());
        })
        .fail(function () {
            return addValidityToFileGroup(false);
        });

    //fs.stat(d, function (er, s) { cb(!er && s.isDirectory()) })

}

function verifyFiles(fileGroup) {

    if (fileGroup.files) {

        var filePromises = [];
        fileGroup.files.forEach(function (fileName) {
            filePromises.push(global.promiseUtils.deNodeify(fs.stat)(global.config.uploadPath + fileGroup.groupId + '/' + fileName)
                .then(function (stat) {
                    return stat ? fileName : null;
                })
                .fail(function () {
                    return null;
                }));
        });
        return global.Promise.all(filePromises)
            .then(function (fileArr) {
                var files = global._.filter(fileArr, function (fileName) {
                    return fileName;
                });
                fileGroup.files = files;
                return fileGroup;
            });

    } else {
        return fileGroup;
    }

}

function downloadFile(file, groupId) {

    var fullPath = global.config.uploadPath + groupId + '/' + file;
    return global.promiseUtils.deNodeify(fs.stat)(fullPath)
        .then(function (s) {
            if (s.isFile()) return global.Promise({ name: file, stream: fs.createReadStream(fullPath) });
        });

}

function _setMkdirp(stub) {
    mkdirp = stub;
}
function _setFs(stub) {
    fs = stub;
}

module.exports = {
    writeFile: global.Promise.fbind(writeFile),
    verifyFileGroups: global.Promise.fbind(verifyFileGroups),
    removeFileGroup: global.Promise.fbind(removeFileGroup),
    removeFile: removeFile,
    downloadFile: downloadFile,
    _setMkdirp: _setMkdirp,
    _setFs: _setFs
};