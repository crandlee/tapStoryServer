'use strict';

var env = process.env.NODE_ENV = process.env.NODE_ENV || 'development';
var config = require('./server/config/config')[env];
var serverSvc = require('./server/services/restifyService');
var fileSystemSvc = require('./server/services/utilities/fileSystemService');
var authSvc = require('./server/services/authentication/passportService');
var dbSvc = require('./server/services/database/databaseService');
var routes = require('./server/routes/routes');

//Authentication Configuration
authSvc.initialize(serverSvc);

//Routes
routes.initialize(serverSvc, fileSystemSvc);

//Database
dbSvc.initialize(config);

//Begin server
serverSvc.beginListen(config.port, function(ret) {
    console.log('%s listening at %s', ret.name || "Server", ret.url || "Unknown Url");
});

