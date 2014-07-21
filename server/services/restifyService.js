var restify = require('restify');
var server = null;

function beginListen(port, next) {

    var svr = getServer();
    port = port || 3030;
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
    var server = getServer();
    server[verb].apply(server, args);

}
module.exports.addRoute = addRoute;

function addMiddleware(middleware, name) {

    console.log('Initializing ' + name  + ' middleware');
    this.Server().use(middleware);

}
module.exports.addMiddleware = addMiddleware;

function getServer() {

    if (!server) {
        server = restify.createServer();
        server.use(restify.queryParser());
        server.use(restify.bodyParser());
    }


    return server;

}
module.exports.Server = getServer;