"use strict";
var cb = require('common-bundle')();

var authCtrl = cb.rootRequire('ctrl-auth');
var uploadsCtrl = cb.rootRequire('ctrl-uploads');
var passport = require('passport');

module.exports = function (serverSvc) {


    //Files/Filegroups
    serverSvc.addRoute('GET', '/users/:userName/fileHelper',
        authCtrl.authenticateMethod(),
        authCtrl.authorizeMethod(authCtrl.adminRolesOrCurrent),
        uploadsCtrl.getUploadsScreen);

    serverSvc.addRoute('GET', '/users/:userName/fileGroups',
        authCtrl.authenticateMethod(),
        authCtrl.authorizeMethod(authCtrl.adminRolesOrCurrent),
        uploadsCtrl.getFileGroups);

    serverSvc.addRoute('POST', '/users/:userName/fileGroups',
        authCtrl.authenticateMethod(),
        authCtrl.authorizeMethod(authCtrl.adminRolesOrCurrent),
        uploadsCtrl.upload);

    serverSvc.addRoute('DEL', '/users/:userName/fileGroups',
        authCtrl.authenticateMethod(),
        authCtrl.authorizeMethod(authCtrl.adminRolesOrCurrent),
        uploadsCtrl.removeFileGroup);

    serverSvc.addRoute('GET', '/users/:userName/fileGroups/:groupId',
        authCtrl.authenticateMethod(),
        authCtrl.authorizeMethod(authCtrl.adminRolesOrCurrent),
        uploadsCtrl.getFileGroups);


    serverSvc.addRoute('POST', '/users/:userName/fileGroups/:groupId/files',
        authCtrl.authenticateMethod(),
        authCtrl.authorizeMethod(authCtrl.adminRolesOrCurrent),
        uploadsCtrl.upload);

    serverSvc.addRoute('DEL', '/users/:userName/fileGroups/:groupId/files',
        authCtrl.authenticateMethod(),
        authCtrl.authorizeMethod(authCtrl.adminRolesOrCurrent),
        uploadsCtrl.removeFile);


    serverSvc.addRoute('GET', '/users/:userName/fileGroups/:groupId/fileHelper',
        authCtrl.authenticateMethod(),
        authCtrl.authorizeMethod(authCtrl.adminRolesOrCurrent),
        uploadsCtrl.getUploadsScreen);


    serverSvc.addRoute('GET', '/users/:userName/fileGroups/:groupId/files',
        authCtrl.authenticateMethod(),
        authCtrl.authorizeMethod(authCtrl.adminRolesOrCurrent),
        uploadsCtrl.downloadFiles);

    serverSvc.addRoute('GET', '/users/:userName/fileGroups/:groupId/:fileName',
        authCtrl.authenticateMethod(),
        authCtrl.authorizeMethod(authCtrl.adminRolesOrCurrent),
        uploadsCtrl.downloadFiles);


};
