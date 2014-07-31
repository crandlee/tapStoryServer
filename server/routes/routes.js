"use strict";

var fileSystemUtility = require('../utilities/fileSystemUtility');
var assert = require('assert');
var coreCtrl = require('../controllers/coreCtrl');
var authCtrl = require('../controllers/authentication/authCtrl');

//Central Repository for more specific routes

function initialize(serverSvc, fileSystemSvc) {

    var dirRouteFileName = 'routes.js';
    console.log('Initializing routes');
    fileSystemUtility.getSubDirectories('./server/routes', function(err, directories) {
        assert.ifError(err);
        directories.forEach(function(dir) {
            var fileName = dir + '/' + dirRouteFileName;
            fileSystemSvc.getFileExistsAsync(fileName, function(exists) {
               if (exists) {
                    require(fileName.replace('./server/routes','./')
                        .replace('.js', ''))(serverSvc);
               }
            });
        });

    });

    //Add core route
    serverSvc.addRoute('GET', '/',
        authCtrl.authenticateMethod(),
        coreCtrl.core);


}


module.exports.initialize = initialize;