"use strict";
var cb = require('common-bundle')();
var _ = cb._;

var authCtrl = cb.rootRequire('ctrl-auth');
var relCtrlExt = cb.rootRequire('ctrl-rel-ext');
var enums = cb.enums;

module.exports = function (serverSvc) {


    //Friendships

    serverSvc.addRoute(enums.routeMethods.POST, '/users/:userName/friendships',
        authCtrl.authorizeMethod(authCtrl.currentUserAndAdult),
        relCtrlExt.addFriendship);

    serverSvc.addRoute(enums.routeMethods.POST, '/users/:userName/friendships/acknowledgement',
        authCtrl.authorizeMethod(authCtrl.currentUserAndAdult),
        relCtrlExt.acknowledgeFriendship);

    serverSvc.addRoute(enums.routeMethods.DEL, '/users/:userName/friendships',
        authCtrl.authorizeMethod(authCtrl.adminRolesOrCurrent),
        relCtrlExt.deactivateFriendship);

    serverSvc.addRoute(enums.routeMethods.GET, '/users/:userName/friendships',
        authCtrl.authorizeMethod(authCtrl.adminRolesOrCurrent),
        relCtrlExt.getFriendships);

    serverSvc.addRoute(enums.routeMethods.GET, '/users/:userName/friendships/:relUser',
        authCtrl.authorizeMethod(authCtrl.adminRolesOrCurrent),
        relCtrlExt.getFriend);


    //Guardian
    //Guardians can add other guardians to their children.

    serverSvc.addRoute(enums.routeMethods.POST, '/users/:userName/guardianships',
        authCtrl.authorizeMethod(authCtrl.currentUserAndAdult),
        relCtrlExt.addGuardianship);

    serverSvc.addRoute(enums.routeMethods.POST, '/users/:userName/guardianships/:relUser/activation',
        authCtrl.authorizeMethod(cb.extend({ allowInactive: true }, authCtrl.currentUserAndGuardian)),
        relCtrlExt.activateChild);

    serverSvc.addRoute(enums.routeMethods.PUT, '/users/:userName/guardianships/:relUser',
        authCtrl.authorizeMethod(authCtrl.currentUserAndGuardian),
        relCtrlExt.updateChild);

    serverSvc.addRoute(enums.routeMethods.DEL, '/users/:userName/guardianships/:relUser',
        authCtrl.authorizeMethod(cb.extend({ allowInactive: true }, authCtrl.currentUserAndGuardian)),
        relCtrlExt.deactivateChild);

    serverSvc.addRoute(enums.routeMethods.GET, '/users/:userName/guardianships',
        authCtrl.authorizeMethod(authCtrl.adminRolesOrCurrent),
        relCtrlExt.getGuardianships);

    serverSvc.addRoute(enums.routeMethods.GET, '/users/:userName/guardianships/:relUser',
        authCtrl.authorizeMethod(authCtrl.currentUserAndGuardian),
        relCtrlExt.getChild);

    serverSvc.addRoute(enums.routeMethods.GET, '/users/:userName/guardianships/:relUser/friendships',
        authCtrl.authorizeMethod(cb.extend({ isAdmin: true }, authCtrl.currentUserAndGuardian)),
        relCtrlExt.getChildFriendships);

    serverSvc.addRoute(enums.routeMethods.POST, '/users/:userName/guardianships/:relUser/friendships/acknowledgement',
        authCtrl.authorizeMethod(authCtrl.currentUserAndGuardian),
        relCtrlExt.acknowledgeChildFriendship);

    serverSvc.addRoute(enums.routeMethods.POST, '/users/:userName/guardianships/:relUser/friendships',
        authCtrl.authorizeMethod(authCtrl.currentUserAndGuardian),
        relCtrlExt.addChildFriendship);

    serverSvc.addRoute(enums.routeMethods.DEL, '/users/:userName/guardianships/:relUser/friendships',
        authCtrl.authorizeMethod(cb.extend({ isAdmin: true }, authCtrl.currentUserAndGuardian)),
        relCtrlExt.deactivateChildFriendship);

    serverSvc.addRoute(enums.routeMethods.GET, '/users/:userName/guardianships/:relUser/friendships/:relUser2',
        authCtrl.authorizeMethod(authCtrl.adminRolesOrCurrent),
        relCtrlExt.getChildFriend);

};