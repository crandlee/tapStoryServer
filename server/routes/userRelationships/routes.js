"use strict";
var cb = require('common-bundle')();
var _ = cb._;

var authCtrl = cb.rootRequire('ctrl-auth');
var relCtrl = cb.rootRequire('ctrl-rel');
var relCtrlExt = cb.rootRequire('ctrl-rel-ext');

var userCtrl = cb.rootRequire('ctrl-user');
var enums = cb.rootRequire('enums');

module.exports = function (serverSvc) {


    //Friendships
    //Adults can create friendships by request to other adults only
    //Other adults can view pending friendship requests and can acknowledge them to make them active
    //Adults can view their active friendships and deactivate them at any time

    serverSvc.addRoute('POST', '/users/:userName/friendships',
        authCtrl.authorizeMethod(authCtrl.currentUserAndAdult),
        relCtrlExt.addFriendship);

    serverSvc.addRoute('POST', '/users/:userName/friendships/acknowledgement',
        authCtrl.authorizeMethod(authCtrl.currentUserAndAdult),
        relCtrlExt.acknowledgeFriendship);

    serverSvc.addRoute('DEL', '/users/:userName/friendships',
        authCtrl.authorizeMethod(authCtrl.adminRolesOrCurrent),
        relCtrlExt.deactivateFriendship);

    serverSvc.addRoute('GET', '/users/:userName/friendships',
        authCtrl.authorizeMethod(authCtrl.adminRolesOrCurrent),
        relCtrlExt.getFriendships);

    serverSvc.addRoute('GET', '/users/:userName/friendships/:relUser',
        authCtrl.authorizeMethod(authCtrl.adminRolesOrCurrent),
        relCtrlExt.getFriend);


    //Guardian
    //Adults can add new children accounts which are immediately active
    //Guardians can view all of their children and the existing relationships of their children
    //Guardians can add friendships for their children.
    //Guardians can add other guardians to their children.
    //Guardians can deactivate friendships for their children.
    //Guardians can remove child accounts

    serverSvc.addRoute('POST', '/users/:userName/guardianships',
        authCtrl.authorizeMethod(authCtrl.currentUserAndAdult),
        relCtrlExt.addGuardianship);

    serverSvc.addRoute('PUT', '/users/:userName/guardianships/:relUser',
        authCtrl.authorizeMethod(authCtrl.currentUserAndGuardian),
        relCtrlExt.updateChild);

    serverSvc.addRoute('GET', '/users/:userName/guardianships',
        authCtrl.authorizeMethod(authCtrl.adminRolesOrCurrent),
        relCtrlExt.getGuardianships);

    serverSvc.addRoute('GET', '/users/:userName/guardianships/:relUser',
        authCtrl.authorizeMethod(authCtrl.adminRolesOrCurrent),
        relCtrlExt.getChild);

};