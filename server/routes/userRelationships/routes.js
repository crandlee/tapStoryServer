"use strict";
var cb = require('common-bundle')();
var _ = cb._;

var authCtrl = cb.rootRequire('ctrl-auth');
var relCtrlExt = cb.rootRequire('ctrl-rel-ext');
var enums = cb.enums;

module.exports = function (serverSvc) {


    //Friendships

    serverSvc.addRoute(enums.routeMethods.POST, '/users/:userName/friendships',
        authCtrl.authorizeMethod(authCtrl.currentAdultOrGuardian),
        relCtrlExt.addFriendship);

    serverSvc.addRoute(enums.routeMethods.POST, '/users/:userName/friendships/acknowledgement',
        authCtrl.authorizeMethod(authCtrl.currentAdultOrGuardian),
        relCtrlExt.acknowledgeFriendship);

    serverSvc.addRoute(enums.routeMethods.DEL, '/users/:userName/friendships',
        authCtrl.authorizeMethod(authCtrl.adminRolesCurrentAdultOrGuardian),
        relCtrlExt.deactivateFriendship);

    serverSvc.addRoute(enums.routeMethods.GET, '/users/:userName/friendships',
        authCtrl.authorizeMethod(authCtrl.adminRolesCurrentAdultOrGuardian),
        relCtrlExt.getFriendships);


    //Guardian
    //Guardians can add other guardians to their children.

    serverSvc.addRoute(enums.routeMethods.POST, '/users/:userName/guardianships',
        authCtrl.authorizeMethod(authCtrl.currentUserAndAdult),
        relCtrlExt.addGuardianship);

    serverSvc.addRoute(enums.routeMethods.DEL, '/users/:userName/guardianships',
        authCtrl.authorizeMethod(cb.extend({ allowInactive: { val: true } }, authCtrl.currentUserAndGuardian)),
        relCtrlExt.deactivateGuardianship);

    serverSvc.addRoute(enums.routeMethods.GET, '/users/:userName/guardianships',
        authCtrl.authorizeMethod(authCtrl.adminRolesOrCurrentAdult),
        relCtrlExt.getGuardianships);



};