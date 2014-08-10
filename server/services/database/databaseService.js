"use strict";
require('require-enhanced')();

var mongoose = require('mongoose');
var fileSystemUtility = global.rootRequire('util-filesystem');
var _ = require('lodash');

function connectDb(config) {

    mongoose.connect(config.db);
    var db = mongoose.connection;
    db.on('error', console.error.bind(console, 'MongoDb Connection Error'));
    db.once('open', function () {
        console.log('MongoDb Connection Opened');
    });

}
function loadModels() {

    fileSystemUtility.getFilesRecursive('./server/models')
        .done(function(files) {
            _.map(files, function(fileName) {
                require('../../../' + fileName.replace('.js',''));
            });
        });

}

function initialize(config) {

    console.log('Initializing database ' + config.db);
    connectDb(config);
    console.log('Loading models');
    loadModels();

    //TODO-Randy: Add default data
}
module.exports.initialize = initialize;

