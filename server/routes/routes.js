"use strict";
require('require-enhanced')();

var fileSystemUtility = global.rootRequire('util-filesystem');
var coreCtrl = global.rootRequire('ctrl-core');
var authCtrl = global.rootRequire('ctrl-auth');

//Central Repository for more specific routes

function initialize(serverSvc, fileSystemSvc) {

    var dirRouteFileName = 'routes.js';
    console.log('Initializing routes');
    fileSystemUtility.getSubDirectories('./server/routes', function(err, directories) {
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

    //Add core routes
    serverSvc.addRoute('GET', '/',
        authCtrl.authenticateMethod(),
        coreCtrl.core);

}


module.exports.initialize = initialize;