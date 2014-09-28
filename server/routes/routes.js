"use strict";
var cb = require('common-bundle')();

var fileSystemUtility = cb.rootRequire('util-filesystem');
var coreCtrl = cb.rootRequire('ctrl-core');
var enums = cb.enums;
var a = enums.auth;

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


    var urlObj = { protocol: cb.config.protocol, hostname: cb.config.hostname,
        pathname: cb.config.baseUri};
    if (cb.config.usePortInHypermedia) urlObj.port = cb.config.port;

    var rs = cb.rootRequire('route-builder')(serverSvc.addRoute,
        require('url').format(urlObj));

    rs.addResource({ uri: '', name: 'root', rel: 'root'} )
        .addMethod(rs.resourceMethods.GET, { rules: [a.Guest]}, coreCtrl.core,
            { self: true });

}

module.exports.initialize = initialize;