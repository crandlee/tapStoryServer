"use strict";
require('require-enhanced')();

var authCtrl = global.rootRequire('ctrl-auth');
var uploadsCtrl = global.rootRequire('ctrl-uploads');

var passport = require('passport');

module.exports = function (serverSvc) {


    //Files/Filegroups
    serverSvc.addRoute('GET', '/users/:userName/fileHelper',
        authCtrl.authenticateMethod(),
        uploadsCtrl.getUploadsScreen);

    serverSvc.addRoute('GET', '/users/:userName/fileGroups',
        authCtrl.authenticateMethod(),
        uploadsCtrl.getFileGroups);

    serverSvc.addRoute('POST', '/users/:userName/fileGroups',
        authCtrl.authenticateMethod(),
        uploadsCtrl.upload);

    serverSvc.addRoute('GET', '/users/:userName/fileGroups/:groupId',
        authCtrl.authenticateMethod(),
        uploadsCtrl.getFileGroups);

    serverSvc.addRoute('POST', '/users/:userName/fileGroups/:groupId',
        authCtrl.authenticateMethod(),
        uploadsCtrl.upload);


};
