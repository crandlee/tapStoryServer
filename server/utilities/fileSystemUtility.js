var fileSystemSvc = require('../services/utilities/fileSystemService');
var recursive = require('recursive-readdir');
var Q = require('q');

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
module.exports.getSubDirectories = getSubDirectories;


function getFilesRecursive(rootPath) {
    var deferred = Q.defer();
    recursive(rootPath, function(err, files) {
        if (err) {
            deferred.reject(err);
        } else {
            deferred.resolve(files);
        }
    });
    return deferred.promise;
}
module.exports.getFilesRecursive = getFilesRecursive;
