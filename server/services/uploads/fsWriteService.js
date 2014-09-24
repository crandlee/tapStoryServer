'use strict';
var cb = require('common-bundle')();
var _ = cb._;
var errSvc = cb.errSvc;
var promise = cb.Promise;

var fs = require('fs');
var mkdirp = require('mkdirp');
var rimraf = require('rimraf');
var logSvc = cb.rootRequire('svc-logging');


function removeFileGroup(groupId) {

    var destPath = cb.config.uploadPath + groupId;
    return cb.promiseUtils.deNodeify(rimraf)(destPath)
        .fail(cb.errSvc.promiseError("Could not remove file group from system",
            { groupId: groupId }));

}

function removeFile(groupId, fileName) {

    var destPath = cb.config.uploadPath + groupId + '/' + fileName;
    return cb.promiseUtils.deNodeify(fs.unlink)(destPath)
        .fail(function (err) {
            logSvc.logWarning("An error message was returned trying to remove a file",
                { error: err, groupId: groupId, fileName: fileName  });
        });

}

function writeFile(destFile, data, options) {

    var finalizeFile = options.finalizeFile || function (destPath, data) {

        return cb.promiseUtils.deNodeify(fs.writeFile)(destPath, data)
            .fail(errSvc.promiseError("Could not write upload file to file system",
                { path: destPath }));

    };

    var optionalDir = options.dirName || '';
    var destPath = cb.config.uploadPath + destFile;

    //Handle optional subfolder under upload folder
    if (optionalDir) {
        var projectedPath = cb.config.uploadPath + optionalDir;
        return cb.promiseUtils.deNodeify(mkdirp)(projectedPath)
            .then(function (ret) {
                //Sending return value of this to finalizeFile for unit testing results
                //verifying the call to mkdirp.  Not sure of a better way to do this.
                return finalizeFile(projectedPath + '/' + destFile, data, ret);
            })
            .fail(cb.errSvc.promiseError("Could not create the specified upload directory",
                { path: projectedPath }));
    } else {
        return finalizeFile(destPath, data);
    }

}

function verifyFileGroups(fileGroups) {
    return promise.all(_.map(fileGroups, function (fileGroup) {
        return verifyFileGroup(fileGroup)
            .then(verifyFiles);
    }))
        .then(function (fg) {
            //Return only valid
            return _.chain(fg)
                .filter('valid')
                .map(function (fg) {
                    delete fg.valid;
                    return fg;
                })
                .value();
        })
        .fail(errSvc.promiseError("Error verifying file groups",
            { groupIds: _.map(fileGroups, 'groupId') }));

    //fs.stat(d, function (er, s) { cb(!er && s.isDirectory()) })

}

function verifyFileGroup(fileGroup) {

    function addValidityToFileGroup(valid) {
        if (fileGroup) fileGroup.valid = valid;
        return fileGroup;
    }

    return cb.promiseUtils.deNodeify(fs.stat)(cb.config.uploadPath + fileGroup.groupId)
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
        fileGroup.files.forEach(function (file) {
            filePromises.push(cb.promiseUtils.deNodeify(fs.stat)(cb.config.uploadPath + fileGroup.groupId + '/' + file.fileName)
                .then(function (stat) {
                    return stat ? file : null;
                })
                .fail(function () {
                    return null;
                }));
        });
        return promise.all(filePromises)
            .then(function (fileArr) {
                //Return only non-null names, meaning they passed the stat check
                //from the previous step
                fileGroup.files = _.filter(fileArr, function (file) {
                    if (!file) return null;
                    return !!file.fileName;
                });
                return fileGroup;
            });

    } else {
        return fileGroup;
    }

}

function downloadFile(file, groupId) {

    var fullPath = cb.config.uploadPath + groupId + '/' + file;
    return cb.promiseUtils.deNodeify(fs.stat)(fullPath)
        .then(function (s) {
            if (s.isFile()) return promise({ name: file, stream: fs.createReadStream(fullPath) });
        });

}

function _setMkdirp(stub) {
    mkdirp = stub;
}
function _setFs(stub) {
    fs = stub;
}

module.exports = {
    writeFile: promise.fbind(writeFile),
    verifyFileGroups: promise.fbind(verifyFileGroups),
    removeFileGroup: promise.fbind(removeFileGroup),
    removeFile: removeFile,
    downloadFile: downloadFile,
    _setMkdirp: _setMkdirp,
    _setFs: _setFs
};