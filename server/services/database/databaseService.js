"use strict";
require('require-enhanced')();

var mongoose = require('mongoose');
var fileSystemUtility = global.rootRequire('util-filesystem');
var _ = require('lodash');

function connectDb(config) {

    mongoose.connect(config.db);
    var db = mongoose.connection;
    db.on('error', console.error.bind(console, 'MongoDb Connection Error'));
    db.on('open', function () {
        console.log('MongoDb Connection Opened');
        console.log('Loading models');
        loadModels()
            .then(function(){
                if (global.canBeginTest === null)
                    global.canBeginTest = true;
            })
            .fail(function(err) { throw err; })
            .done();

    });

    return db;

}
function loadModels() {

    return fileSystemUtility.getFilesRecursive(global.rootPath + 'server/models')
        .then(function(files) {
            return global.Promise(_.map(files, function(fileName) {
                require(fileName.replace('.js',''));
            }));
        });

}

function initialize(config) {

    console.log('Initializing database ' + config.db);
    return connectDb(config);
   
}
module.exports.initialize = initialize;

