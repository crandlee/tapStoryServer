"use strict";
var cb = require('common-bundle')();
var _ = cb._;

var authCtrl = cb.rootRequire('ctrl-auth');
var relCtrlExt = cb.rootRequire('ctrl-rel-ext');
var enums = cb.enums;

module.exports = function (serverSvc) {


    //Add friends
    //Authorize: CurrentAdult/NoChild:StrictGuardian
    serverSvc.addRoute(enums.routeMethods.POST, '/users/:userName/friendships',
        authCtrl.authorize(authCtrl.currentAdultOrGuardian),
        relCtrlExt.addFriendship);

    //Acknowledge Friend
    //Authorize: CurrentAdult/NoChild:StrictGuardian
    serverSvc.addRoute(enums.routeMethods.POST, '/users/:userName/friendships/acknowledgement',
        authCtrl.authorize(authCtrl.currentAdultOrGuardian),
        relCtrlExt.acknowledgeFriendship);

    //Deactivate Friend
    //Authorize: Admin/CurrentAdult/CurrentChild:NonStrictGuardian
    //TODO-Randy: Delete subscriptions when relationship becomes inactive
    serverSvc.addRoute(enums.routeMethods.DEL, '/users/:userName/friendships',
        authCtrl.authorize(authCtrl.adminRolesCurrentAdultOrGuardian),
        relCtrlExt.deactivateFriendship);

    //View friendships
    //Authorize: Admin/CurrentAdult/CurrentChild:NonStrictGuardian
    serverSvc.addRoute(enums.routeMethods.GET, '/users/:userName/friendships',
        authCtrl.authorize(authCtrl.adminRolesCurrentAdultOrGuardian),
        relCtrlExt.getFriendships);


    //Add New Child
    //Authorize: CurrentAdult
    serverSvc.addRoute(enums.routeMethods.POST, '/users/:userName/guardianships',
        authCtrl.authorize(authCtrl.currentUserAndAdult),
        relCtrlExt.addGuardianship);

    //View Guardianship
    //Authorize: Admin/CurrentAdult
    serverSvc.addRoute(enums.routeMethods.GET, '/users/:userName/guardianships',
        authCtrl.authorize(authCtrl.adminRolesOrCurrentAdult),
        relCtrlExt.getGuardianships);



    //View Guardians (User name assumed child)
    //Authorize: Admin/CurrentChild:NonStrictGuardian
    //TODO-Randy: Add this route
//    serverSvc.addRoute(enums.routeMethods.GET, '/users/:userName/guardians',
//        authCtrl.authorize(authCtrl.adminRolesOrCurrentAdult),
//        relCtrlExt.getGuardians);

    //Add guardian (User name assumed child)
    //Authorize: NoChild:StrictGuardian
    serverSvc.addRoute(enums.routeMethods.GET, '/users/:userName/guardians',
        authCtrl.authorize(authCtrl.adminRolesOrCurrentAdult),
        relCtrlExt.getGuardianships);

    //De-activate Guardianship (User name assumed child)
    //Authorize: NoChild:StrictGuardian
    //TODO-Randy: Delete subscriptions when relationship becomes inactive
    //TODO-Randy: Disallow removing last guardian
    serverSvc.addRoute(enums.routeMethods.DEL, '/users/:userName/guardians',
        authCtrl.authorize(cb.extend({ allowInactive: { val: true } }, authCtrl.currentUserAndGuardian)),
        relCtrlExt.deactivateGuardianship);




};