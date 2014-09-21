"use strict";
var cb = require('common-bundle')();
var _ = cb._;

var authMdl = cb.rootRequire('mdl-auth');
var relCtrlExt = cb.rootRequire('ctrl-rel-ext');
var enums = cb.enums;
var a = enums.auth;

module.exports = function (serverSvc) {


    //Add friends
    //Authorize: CurrentAdult/NoChild:StrictGuardian
    serverSvc.addRoute(enums.routeMethods.POST, '/users/:userName/friendships',
        authMdl.authorize([a.CurrentAdult, a.StrictGuardian]),
        relCtrlExt.addFriendship);

    //Acknowledge Friend
    //Authorize: CurrentAdult/NoChild:StrictGuardian
    serverSvc.addRoute(enums.routeMethods.POST, '/users/:userName/friendships/acknowledgement',
        authMdl.authorize([a.CurrentAdult, a.StrictGuardian]),
        relCtrlExt.acknowledgeFriendship);

    //Deactivate Friend
    //Authorize: Admin/CurrentAdult/CurrentChild:NonStrictGuardian
    //TODO-Randy: Delete subscriptions when relationship becomes inactive
    serverSvc.addRoute(enums.routeMethods.DEL, '/users/:userName/friendships',
        authMdl.authorize([a.Admin, a.CurrentAny, a.NonStrictGuardian]),
        relCtrlExt.deactivateFriendship);

    //View friendships
    //Authorize: Admin/CurrentAdult/CurrentChild:NonStrictGuardian
    serverSvc.addRoute(enums.routeMethods.GET, '/users/:userName/friendships',
        authMdl.authorize([a.Admin, a.CurrentAny, a.StrictGuardian]),
        relCtrlExt.getFriendships);


    //Add New Child
    //Authorize: CurrentAdult
    serverSvc.addRoute(enums.routeMethods.POST, '/users/:userName/guardianships',
        authMdl.authorize([a.CurrentAdult]),
        relCtrlExt.addGuardianship);

    //View Guardianship
    //Authorize: Admin/CurrentAdult
    serverSvc.addRoute(enums.routeMethods.GET, '/users/:userName/guardianships',
        authMdl.authorize([a.Admin, a.CurrentAdult]),
        relCtrlExt.getGuardianships);


    //View Guardians (User name assumed child)
    //Authorize: Admin/CurrentChild:NonStrictGuardian
    serverSvc.addRoute(enums.routeMethods.GET, '/users/:userName/guardians',
        authMdl.authorize([a.Admin, a.CurrentChild, a.NonStrictGuardian]),
        relCtrlExt.getGuardianships);

    //Add guardian (User name assumed child)
    //Authorize: NoChild:StrictGuardian
    serverSvc.addRoute(enums.routeMethods.POST, '/users/:userName/guardians',
        authMdl.authorize([a.StrictGuardian]),
        relCtrlExt.addAdditionalGuardian);

    //De-activate Guardianship (User name assumed child)
    //Authorize: NoChild:StrictGuardian
    serverSvc.addRoute(enums.routeMethods.DEL, '/users/:userName/guardians',
        authMdl.authorize([a.StrictOneOfMultipleGuardians]),
        relCtrlExt.deactivateGuardianship);

};