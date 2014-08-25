"use strict";
require('require-enhanced')();

var fileSystemSvc = global.rootRequire('svc-filesystem');
var recursive = require('recursive-readdir');

module.exports.setFileSystemService = function(fss) {
    fileSystemSvc = fss;
};

function getSubDirectories (dir, done) {
    //fn takes parameters (err, directoryPath)
    if (done && typeof(done) === 'function') {
        var results = [];
        fileSystemSvc.readDirectoryAsync(dir, function (err, list) {
            if (err) return done(err);
            var pending = list.length;
            if (!pending) return (done(null, results));
            list.forEach(function(fileSpec) {
                fileSpec = dir + '/' + fileSpec;
                fileSystemSvc.getStatsAsync(fileSpec, function(err, stat) {
                    if (stat && stat.isDirectory()) {
                        results.push(fileSpec);
                        getSubDirectories(fileSpec, function() {
                            if (!--pending) done(null, results);
                        });
                    } else {
                        if (!--pending) done(null, results);
                    }
                });

            });

        });
    }
}

function getFilesRecursive(rootPath) {
    return global.Promise.denodeify(recursive)(rootPath);
}

module.exports = {
    getFilesRecursive: getFilesRecursive,
    getSubDirectories: getSubDirectories
};
