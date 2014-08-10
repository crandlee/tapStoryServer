"use strict";
require('require-enhanced')();

var fs = require('fs');


function readDirectoryAsync(path, callback) {

    return fs.readdir(path, callback);

}
module.exports.readDirectoryAsync = readDirectoryAsync;


function getStatsAsync(file, callback) {

  return fs.stat(file, callback);

}
module.exports.getStatsAsync = getStatsAsync;


function getFileExistsAsync(path, callback) {

    return fs.exists(path, callback);

}
module.exports.getFileExistsAsync = getFileExistsAsync;