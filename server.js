'use strict';

//Load the enhanced require functionality
var cb = require('common-bundle')();

var config = cb.config;
var serverSvc = cb.rootRequire('svc-restify');
var fileSystemSvc = cb.rootRequire('svc-filesystem');
var authSvc = cb.rootRequire('svc-passport');
var dbSvc = cb.rootRequire('svc-database');
var routes = cb.rootRequire('route-root');

//Authentication Configuration
authSvc.initialize(serverSvc);

//Database
dbSvc.initialize(config).on('open', function() {

    //Routes
    routes.initialize(serverSvc, fileSystemSvc);

    //Begin server
    serverSvc.beginListen(config.port, function(ret) {
        console.log('%s listening at %s', ret.name || "Server", ret.url || "Unknown Url");
    });

});


