"use strict";
var cb = require('common-bundle')();

var authCtrl = cb.rootRequire('ctrl-auth');
var uploadsCtrl = cb.rootRequire('ctrl-uploads');
var passport = require('passport');
var enums = cb.enums;

module.exports = function (serverSvc) {


    //Files/Filegroups
    serverSvc.addRoute(enums.routeMethods.GET, '/users/:userName/fileHelper',
        authCtrl.authorizeMethod(authCtrl.adminRolesCurrentUserOrGuardian),
        uploadsCtrl.getUploadsScreen);

    serverSvc.addRoute(enums.routeMethods.GET, '/users/:userName/fileGroups',
        authCtrl.authorizeMethod(authCtrl.adminRolesCurrentUserOrGuardian),
        uploadsCtrl.getFileGroups);

    serverSvc.addRoute(enums.routeMethods.POST, '/users/:userName/fileGroups',
        authCtrl.authorizeMethod(authCtrl.adminRolesCurrentUserOrGuardian),
        uploadsCtrl.upload);

    serverSvc.addRoute(enums.routeMethods.DEL, '/users/:userName/fileGroups',
        authCtrl.authorizeMethod(authCtrl.adminRolesCurrentUserOrGuardian),
        uploadsCtrl.removeFileGroup);

    serverSvc.addRoute(enums.routeMethods.GET, '/users/:userName/fileGroups/:groupId',
        authCtrl.authorizeMethod(authCtrl.adminRolesCurrentUserOrGuardian),
        uploadsCtrl.getFileGroups);


    serverSvc.addRoute(enums.routeMethods.POST, '/users/:userName/fileGroups/:groupId/files',
        authCtrl.authorizeMethod(authCtrl.adminRolesCurrentUserOrGuardian),
        uploadsCtrl.upload);

    serverSvc.addRoute(enums.routeMethods.DEL, '/users/:userName/fileGroups/:groupId/files',
        authCtrl.authorizeMethod(authCtrl.adminRolesCurrentUserOrGuardian),
        uploadsCtrl.removeFile);


    serverSvc.addRoute(enums.routeMethods.GET, '/users/:userName/fileGroups/:groupId/fileHelper',
        authCtrl.authorizeMethod(authCtrl.adminRolesCurrentUserOrGuardian),
        uploadsCtrl.getUploadsScreen);


    serverSvc.addRoute(enums.routeMethods.GET, '/users/:userName/fileGroups/:groupId/files',
        authCtrl.authorizeMethod(authCtrl.adminRolesCurrentUserOrGuardian),
        uploadsCtrl.downloadFiles);

    serverSvc.addRoute(enums.routeMethods.GET, '/users/:userName/fileGroups/:groupId/:fileName',
        authCtrl.authorizeMethod(authCtrl.adminRolesCurrentUserOrGuardian),
        uploadsCtrl.downloadFiles);


};
