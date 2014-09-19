"use strict";
var cb = require('common-bundle')();

var fileSystemUtility = cb.rootRequire('util-filesystem');
var coreCtrl = cb.rootRequire('ctrl-core');
var authCtrl = cb.rootRequire('ctrl-auth');
var enums = cb.enums;
var a = enums.auth;

//Central Repository for more specific routes

function initialize(serverSvc, fileSystemSvc) {

    var dirRouteFileName = 'routes.js';
    console.log('Initializing routes');
//    fileSystemUtility.getSubDirectories('./server/routes', function(err, directories) {
//        directories.forEach(function(dir) {
//            var fileName = dir + '/' + dirRouteFileName;
//            fileSystemSvc.getFileExistsAsync(fileName, function(exists) {
//               if (exists) {
//                    require(fileName.replace('./server/routes','./')
//                        .replace('.js', ''))(serverSvc);
//               }
//            });
//        });
//
//    });

    //Add core routes
//    serverSvc.addRoute(enums.routeMethods.GET, '/',
//        authCtrl.authenticateMethod(),
//        coreCtrl.core);

    serverSvc.addRoute(enums.routeMethods.GET, '/:userName',
        authCtrl.authorize([a.CurrentAny]),
        coreCtrl.core);

}

module.exports.initialize = initialize;