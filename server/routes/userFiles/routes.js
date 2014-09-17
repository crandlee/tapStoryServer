"use strict";
var cb = require('common-bundle')();

var authCtrl = cb.rootRequire('ctrl-auth');
var uploadsCtrl = cb.rootRequire('ctrl-uploads');
var passport = require('passport');
var enums = cb.enums;

module.exports = function (serverSvc) {


    //Files/Filegroups
    serverSvc.addRoute(enums.routeMethods.GET, '/users/:userName/fileHelper',
        authCtrl.authorizeMethod(authCtrl.adminRolesOrCurrent),
        uploadsCtrl.getUploadsScreen);

    serverSvc.addRoute(enums.routeMethods.GET, '/users/:userName/fileGroups',
        authCtrl.authorizeMethod(authCtrl.adminRolesOrCurrent),
        uploadsCtrl.getFileGroups);

    serverSvc.addRoute(enums.routeMethods.POST, '/users/:userName/fileGroups',
        authCtrl.authorizeMethod(authCtrl.adminRolesOrCurrent),
        uploadsCtrl.upload);

    serverSvc.addRoute(enums.routeMethods.DEL, '/users/:userName/fileGroups',
        authCtrl.authorizeMethod(authCtrl.adminRolesOrCurrent),
        uploadsCtrl.removeFileGroup);

    serverSvc.addRoute(enums.routeMethods.GET, '/users/:userName/fileGroups/:groupId',
        authCtrl.authorizeMethod(authCtrl.adminRolesOrCurrent),
        uploadsCtrl.getFileGroups);


    serverSvc.addRoute(enums.routeMethods.POST, '/users/:userName/fileGroups/:groupId/files',
        authCtrl.authorizeMethod(authCtrl.adminRolesOrCurrent),
        uploadsCtrl.upload);

    serverSvc.addRoute(enums.routeMethods.DEL, '/users/:userName/fileGroups/:groupId/files',
        authCtrl.authorizeMethod(authCtrl.adminRolesOrCurrent),
        uploadsCtrl.removeFile);


    serverSvc.addRoute(enums.routeMethods.GET, '/users/:userName/fileGroups/:groupId/fileHelper',
        authCtrl.authorizeMethod(authCtrl.adminRolesOrCurrent),
        uploadsCtrl.getUploadsScreen);


    serverSvc.addRoute(enums.routeMethods.GET, '/users/:userName/fileGroups/:groupId/files',
        authCtrl.authorizeMethod(authCtrl.adminRolesOrCurrent),
        uploadsCtrl.downloadFiles);

    serverSvc.addRoute(enums.routeMethods.GET, '/users/:userName/fileGroups/:groupId/:fileName',
        authCtrl.authorizeMethod(authCtrl.adminRolesOrCurrent),
        uploadsCtrl.downloadFiles);


};
