"use strict";
var cb = require('common-bundle')();

var authCtrl = cb.rootRequire('ctrl-auth');
var uploadsCtrl = cb.rootRequire('ctrl-uploads');
var passport = require('passport');
var enums = cb.enums;

module.exports = function (serverSvc) {


    //File Helper for User (Dev only)
    //Authorize: CurrentAdult/CurrentChild:StrictGuardian
    serverSvc.addRoute(enums.routeMethods.GET, '/users/:userName/fileHelper',
        authCtrl.authorize(authCtrl.adminRoles),
        uploadsCtrl.getUploadsScreen);

    //View File Groups
    //Authorize: Admins/CurrentAdult/CurrentChild:NonStrictGuardian
    serverSvc.addRoute(enums.routeMethods.GET, '/users/:userName/fileGroups',
        authCtrl.authorize(authCtrl.adminRolesCurrentUserOrGuardian),
        uploadsCtrl.getFileGroups);

    //Upload File Group
    //Authorize: CurrentAdult/CurrentChild:StrictGuardian
    serverSvc.addRoute(enums.routeMethods.POST, '/users/:userName/fileGroups',
        authCtrl.authorize(authCtrl.adminRolesCurrentUserOrGuardian),
        uploadsCtrl.upload);

    //Delete File Group
    //Authorize: Admins/CurrentAdult/CurrentChild:StrictGuardian
    serverSvc.addRoute(enums.routeMethods.DEL, '/users/:userName/fileGroups',
        authCtrl.authorize(authCtrl.adminRolesCurrentUserOrGuardian),
        uploadsCtrl.removeFileGroup);

    //View File Group
    //Authorize: Admins/CurrentAdult/CurrentChild:NonStrictGuardian
    serverSvc.addRoute(enums.routeMethods.GET, '/users/:userName/fileGroups/:groupId',
        authCtrl.authorize(cb.extend({ fileGroupSharedWith: true }, authCtrl.adminRolesCurrentUserOrGuardian)),
        uploadsCtrl.getFileGroups);


    //Upload single file to existing file group
    //Authorize: CurrentAdult/CurrentChild:StrictGuardian
    serverSvc.addRoute(enums.routeMethods.POST, '/users/:userName/fileGroups/:groupId/files',
        authCtrl.authorize(authCtrl.adminRolesCurrentUserOrGuardian),
        uploadsCtrl.upload);

    //Delete single file from existing file group
    //Authorize: Admin/CurrentAdult/CurrentChild:StrictGuardian
    serverSvc.addRoute(enums.routeMethods.DEL, '/users/:userName/fileGroups/:groupId/files',
        authCtrl.authorize(authCtrl.adminRolesCurrentUserOrGuardian),
        uploadsCtrl.removeFile);


    //File helper for existing file group
    //Authorize: CurrentAdult/CurrentChild:StrictGuardian
    serverSvc.addRoute(enums.routeMethods.GET, '/users/:userName/fileGroups/:groupId/fileHelper',
        authCtrl.authorize(authCtrl.adminRolesCurrentUserOrGuardian),
        uploadsCtrl.getUploadsScreen);


    //File sharing

    //View Subscriptions to a File Group
    //Authorize: Admins/CurrentAdult/CurrentChild:StrictGuardian/SubscribedUser
    serverSvc.addRoute(enums.routeMethods.GET, '/users/:userName/fileGroups/:groupId/fileShares',
        authCtrl.authorize(authCtrl.adminRolesCurrentUserOrGuardian),
        uploadsCtrl.getSharedFileGroup);

    //Subscribe to a File Group (only to relationship users)
    //Authorize: CurrentAdult/NoChild:StrictGuardian
    //TODO-Randy: Verify that only users that have existing relationship can participate in the share
    serverSvc.addRoute(enums.routeMethods.POST, '/users/:userName/fileGroups/:groupId/fileShares',
        authCtrl.authorize(authCtrl.adminRolesCurrentUserOrGuardian),
        uploadsCtrl.shareFileGroup);

    //Unsubscribe to a File Group
    //Authorize: Admin/CurrentAdult/CurrentChild:StrictGuardian/SubscribedUser
    serverSvc.addRoute(enums.routeMethods.DEL, '/users/:userName/fileGroups/:groupId/fileShares',
        authCtrl.authorize(authCtrl.adminRolesCurrentUserOrGuardian),
        uploadsCtrl.unshareFileGroup);


    //Downloading files
    //Authorize: CurrentAdult/CurrentChild:StrictGuardian/SubscribedUser
    serverSvc.addRoute(enums.routeMethods.GET, '/users/:userName/fileGroups/:groupId/files',
        authCtrl.authorize(cb.extend({ fileGroupSharedWith: true }, authCtrl.adminRolesCurrentUserOrGuardian)),
        uploadsCtrl.downloadFiles);

    //Downloading file
    //Authorize: CurrentAdult/CurrentChild:StrictGuardian/SubscribedUser
    serverSvc.addRoute(enums.routeMethods.GET, '/users/:userName/fileGroups/:groupId/:fileName',
        authCtrl.authorize(cb.extend({ fileGroupSharedWith: true }, authCtrl.adminRolesCurrentUserOrGuardian)),
        uploadsCtrl.downloadFiles);



};
