"use strict";
require('require-enhanced')();

var authCtrl = global.rootRequire('ctrl-auth');
var uploadsCtrl = global.rootRequire('ctrl-uploads');

var passport = require('passport');

module.exports = function (serverSvc) {


    //Files/Filegroups
    serverSvc.addRoute('POST', '/users/:userName/files',
        authCtrl.authenticateMethod(),
        uploadsCtrl.upload);

    serverSvc.addRoute('GET', '/users/:userName/fileHelper',
        authCtrl.authenticateMethod(),
        uploadsCtrl.getUploadsScreen);

    serverSvc.addRoute('GET', '/users/:userName/fileGroups',
        authCtrl.authenticateMethod(),
        uploadsCtrl.getFileGroups);

//    serverSvc.addRoute('GET', '/users/:userName/files/:groupId',
//        authCtrl.authenticateMethod(),
//        uploadsCtrl.getFiles);

};
