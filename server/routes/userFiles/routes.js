"use strict";
var cb = require('common-bundle')();

var authMdl = cb.rootRequire('mdl-auth');
var uploadsCtrl = cb.rootRequire('ctrl-uploads');
var passport = require('passport');
var enums = cb.enums;
var a = enums.auth;

module.exports = function (serverSvc) {


    //File sharing
    //View Subscriptions to a File Group
    //Authorize: Admins/CurrentAdult/CurrentChild:NonStrictGuardian
    //TODO-Randy: Need to filter out disabled from various subscription checks ( getShared on the userService )
    serverSvc.addRoute(enums.routeMethods.GET, '/users/:userName/fileGroups/:groupId/fileSubs/:relUser',
        authMdl.authorize([a.Admin, a.CurrentAny, a.NonStrictGuardian, a.Subscribed]),
        uploadsCtrl.getSharedFileGroupForUser);
    serverSvc.addRoute(enums.routeMethods.GET, '/users/:userName/fileGroups/fileSubs',
        authMdl.authorize([a.Admin, a.CurrentAny, a.NonStrictGuardian]),
        uploadsCtrl.getShares);
    serverSvc.addRoute(enums.routeMethods.GET, '/users/:userName/fileGroups/:groupId/fileSubs',
        authMdl.authorize([a.Admin, a.CurrentAny, a.NonStrictGuardian]),
        uploadsCtrl.getSharesFileGroup);

    //Send subscription to a File Group (only to relationship users)
    //Authorize: CurrentAdult/NoChild:StrictGuardian
    serverSvc.addRoute(enums.routeMethods.POST, '/users/:userName/fileGroups/:groupId/fileSubs/:relUser',
        authMdl.authorize([a.CurrentAdult, a.StrictGuardian]),
        uploadsCtrl.shareFileGroup);

    //Unsubscribe from a File Group
    //Authorize: Admin/CurrentAdult/CurrentChild:NonStrictGuardian/SubscribedUser
    serverSvc.addRoute(enums.routeMethods.DEL, '/users/:userName/fileGroups/:groupId/fileSubs/:relUser',
        authMdl.authorize([a.Admin, a.CurrentAny, a.NonStrictGuardian, a.Subscribed]),
        uploadsCtrl.unshareFileGroup);



    //File Helper for User (Dev only)
    //Authorize: CurrentAdult/CurrentChild:StrictGuardian
    serverSvc.addRoute(enums.routeMethods.GET, '/users/:userName/fileHelper',
        authMdl.authorize([a.CurrentAny, a.StrictGuardian]),
        uploadsCtrl.getUploadsScreen);

    //View File Groups
    //Authorize: Admins/CurrentAdult/CurrentChild:NonStrictGuardian
    serverSvc.addRoute(enums.routeMethods.GET, '/users/:userName/fileGroups',
        authMdl.authorize([a.Admin, a.CurrentAny, a.NonStrictGuardian]),
        uploadsCtrl.getFileGroups);

    //Upload File Group
    //Authorize: CurrentAdult/CurrentChild:StrictGuardian
    serverSvc.addRoute(enums.routeMethods.POST, '/users/:userName/fileGroups',
        authMdl.authorize([a.CurrentAny, a.StrictGuardian]),
        uploadsCtrl.upload);

    //Delete File Group
    //Authorize: Admins/CurrentAdult/CurrentChild:StrictGuardian
    serverSvc.addRoute(enums.routeMethods.DEL, '/users/:userName/fileGroups',
        authMdl.authorize([a.Admin, a.CurrentAny, a.StrictGuardian]),
        uploadsCtrl.removeFileGroup);

    //View File Group
    //Authorize: Admins/CurrentAdult/CurrentChild:NonStrictGuardian
    serverSvc.addRoute(enums.routeMethods.GET, '/users/:userName/fileGroups/:groupId',
        authMdl.authorize([a.Admin, a.CurrentAny, a.NonStrictGuardian]),
        uploadsCtrl.getFileGroups);


    //Upload single file to existing file group
    //Authorize: CurrentAdult/CurrentChild:StrictGuardian
    serverSvc.addRoute(enums.routeMethods.POST, '/users/:userName/fileGroups/:groupId/files',
        authMdl.authorize([a.CurrentAny, a.StrictGuardian]),
        uploadsCtrl.upload);

    //Delete single file from existing file group
    //Authorize: Admin/CurrentAdult/CurrentChild:StrictGuardian
    serverSvc.addRoute(enums.routeMethods.DEL, '/users/:userName/fileGroups/:groupId/files',
        authMdl.authorize([a.Admin, a.CurrentAny, a.StrictGuardian]),
        uploadsCtrl.removeFile);


    //File helper for existing file group
    //Authorize: CurrentAdult/CurrentChild:StrictGuardian
    serverSvc.addRoute(enums.routeMethods.GET, '/users/:userName/fileGroups/:groupId/fileHelper',
        authMdl.authorize([a.CurrentAny, a.StrictGuardian]),
        uploadsCtrl.getUploadsScreen);



    //Downloading files
    //Authorize: CurrentAdult/CurrentChild:StrictGuardian/SubscribedUser
    serverSvc.addRoute(enums.routeMethods.GET, '/users/:userName/fileGroups/:groupId/files',
        authMdl.authorize([a.CurrentAny, a.NonStrictGuardian, a.Subscribed]),
        uploadsCtrl.downloadFiles);

    //Downloading file
    //Authorize: CurrentAdult/CurrentChild:StrictGuardian/SubscribedUser
    serverSvc.addRoute(enums.routeMethods.GET, '/users/:userName/fileGroups/:groupId/:fileName',
        authMdl.authorize([a.CurrentAny, a.NonStrictGuardian, a.Subscribed]),
        uploadsCtrl.downloadFiles);



};
