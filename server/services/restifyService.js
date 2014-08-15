"use strict";
require('require-enhanced')();

var restify = require('restify');
var server = null;
var env = process.env.NODE_ENV = process.env.NODE_ENV || 'development';
var config = global.rootRequire('cfg-config')[env];
var cors = global.rootRequire('cfg-cors');
var fs = require('fs');

function beginListen(port, next) {

    var svr = getServer();
    port = port || config.port;
    next = next || function() {};
    svr.listen(port, function() {
        next({name : svr.name, url: svr.url });
    });

}
module.exports.beginListen = beginListen;

function addRoute(verb) {

    //Gets called with params verb, route, handler1, handler2, ...
    if (verb) verb = verb.toLowerCase();
    var args = Array.prototype.slice.call(arguments, 1);
    //Apply the base path to the route
    if (args[0]) args[0] = config.baseUri + args[0];
    var server = getServer();
    server[verb].apply(server, args);

}
module.exports.addRoute = addRoute;

function addMiddleware(middleware, name) {

    console.log('Initializing ' + name  + ' middleware');
    getServer().use(middleware);

}
module.exports.addMiddleware = addMiddleware;

function getServer() {

    if (!server) {
        server = restify.createServer();
        server.use(restify.queryParser());

        //CORS Configuration
        restify.CORS.ALLOW_HEADERS.push('authorization');
        server.use(restify.CORS({
            origins: config.allowedRemoteOrigins
        }));
        server.on('MethodNotAllowed', cors.preflightHandler);

        //MultipartForm / File upload handling
        server.use(restify.bodyParser({
            multipartFileHandler : function(part) {
                part.on('data', function(data) {
                    //TODO-Randy: Refactor this into another module
                    var fileName = part.filename;
                    if (fileName) {
                        fs.writeFile('server/uploads/' + fileName, data, function(err) {
                           if (err) console.log('File upload failed: ' + err);
                        });
                    }
                });
            }
        }));
    }

    return server;

}
module.exports.Server = getServer;