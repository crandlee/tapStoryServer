"use strict";
var cb = require('common-bundle')();
var _ = cb._;
var promise = cb.Promise;

var mongoose = require('mongoose');
var fileSystemUtility = cb.rootRequire('util-filesystem');

function connectDb(config) {

    mongoose.connect(config.db);
    var db = mongoose.connection;
    db.on('error', console.error.bind(console, 'MongoDb Connection Error'));
    db.on('open', function () {
        console.log('MongoDb Connection Opened');
        console.log('Loading models');
        loadModels()
            .then(function(){
                if (cb.canBeginTest === null)
                    cb.canBeginTest = true;
            })
            .fail(function(err) { throw err; })
            .done();

    });

    return db;

}
function loadModels() {

    return fileSystemUtility.getFilesRecursive(cb.rootPath + 'server/models')
        .then(function(files) {
            return promise(_.map(files, function(fileName) {
                require(fileName.replace('.js',''));
            }));
        });

}

function initialize(config) {

    console.log('Initializing database ' + config.db);
    return connectDb(config);
   
}
module.exports.initialize = initialize;

