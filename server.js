'use strict';

//Load the enhanced require functionality
require('require-enhanced')();

var env = process.env.NODE_ENV = process.env.NODE_ENV || 'development';
var config = global.rootRequire('cfg-config')[env];
var serverSvc = global.rootRequire('svc-restify');
var fileSystemSvc = global.rootRequire('svc-filesystem');
var authSvc = global.rootRequire('svc-passport');
var dbSvc = global.rootRequire('svc-database');
var routes = global.rootRequire('route-root');

//Authentication Configuration
authSvc.initialize(serverSvc);

//Routes
routes.initialize(serverSvc, fileSystemSvc);

//Database
dbSvc.initialize(config).on('open', function() {

    //Begin server
    serverSvc.beginListen(config.port, function(ret) {
        console.log('%s listening at %s', ret.name || "Server", ret.url || "Unknown Url");
    });

});


