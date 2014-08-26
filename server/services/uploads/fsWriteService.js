'use strict';
require('require-enhanced')();

var fs = require('fs');
var mkdirp = require('mkdirp');


function writeFile(destFile, data, options) {

    var finalizeFile = options.finalizeFile || function(destPath, data) {

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
            .then(function(ret) {
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

function verifyFileGroups(groupIdArray) {

    return global.Promise.all(global._.map(groupIdArray, function(groupId) {
        return verifyFileGroup(groupId);
    }))
        .then(function(statArr) {
            return global._.chain(statArr)
                .filter('valid')
                .map('groupId')
                .value();
        })
        .fail(global.errSvc.promiseError("Error verifying file groups",
            { groupIdArray: groupIdArray }));

    //fs.stat(d, function (er, s) { cb(!er && s.isDirectory()) })

}

function verifyFileGroup(groupId) {

    function buildFileGroupStruct(valid) {
        return { groupId: groupId, valid: valid };
    }
    return global.promiseUtils.deNodeify(fs.stat)(global.config.uploadPath + groupId)
        .then(function(stat) {
            return buildFileGroupStruct(stat && stat.isDirectory());
        })
        .fail(function() {
            return buildFileGroupStruct(false);
        });

    //fs.stat(d, function (er, s) { cb(!er && s.isDirectory()) })

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
    _setMkdirp: _setMkdirp,
    _setFs: _setFs
};