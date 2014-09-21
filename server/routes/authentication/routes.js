"use strict";
var cb = require('common-bundle')();

var authMdl = cb.rootRequire('mdl-auth');
var userCtrl = cb.rootRequire('ctrl-user');
var enums = cb.enums;
var a = enums.auth;

module.exports = function (serverSvc) {


    //Retrieve All Users - Admins
    //Authorize: Admins
    serverSvc.addRoute(enums.routeMethods.GET, '/users',
        authMdl.authorize([a.Admin]),
        userCtrl.getUsers);

    //Add New User
    //Authorize: Admins/Guest
    //TODO-Randy: Add guest access/require acknowledgement of new user with anti-DDOS
    serverSvc.addRoute(enums.routeMethods.POST, '/users',
        authMdl.authorize([a.Guest]),
        userCtrl.saveUser({addOnly: true}));

    //Get User
    //Authorize: Admins/CurrentAny/Relationships
    serverSvc.addRoute(enums.routeMethods.GET, '/users/:userName',
        authMdl.authorize([a.Admin, a.CurrentAny, a.HasRelationship]),
        userCtrl.getUser);

    //Update User
    //Authorize: Admins/CurrentAdult/NoChild:StrictGuardian
    serverSvc.addRoute(enums.routeMethods.PUT, '/users/:userName',
        authMdl.authorize([a.Admin, a.CurrentAdult, a.StrictGuardian]),
        userCtrl.saveUser({addOnly: false}));

    //Delete User
    //Authorize: Admins/CurrentAdult/CurrentChild:NonStrictGuardian
    //TODO-Randy: Active relationships on disabled users don't pull up on any relationship queries
    serverSvc.addRoute(enums.routeMethods.DEL, '/users/:userName',
        authMdl.authorize([a.Admin, a.CurrentAdult, a.NonStrictGuardian]),
        userCtrl.deactivateUser);

    //Re-Activate User
    //Authorize: Admins/Guest
    serverSvc.addRoute(enums.routeMethods.POST, '/users/:userName/activation',
        authMdl.authorize([a.Admin, a.CurrentAdult, a.StrictGuardian], { allowInactive: true }),
        userCtrl.activateUser);

    //Get Roles
    //Authorize: Admins
    serverSvc.addRoute(enums.routeMethods.GET, '/users/:userName/roles',
        authMdl.authorize([a.Admin]),
        userCtrl.getRoles);

    //Add Roles
    //Authorize: Super-Admins
    serverSvc.addRoute(enums.routeMethods.POST, '/users/:userName/roles',
        authMdl.authorize([a.SuperAdmin]),
        userCtrl.addRole);

    //Remove Roles
    //Authorize: Super-Admins
    serverSvc.addRoute(enums.routeMethods.DEL, '/users/:userName/roles',
        authMdl.authorize([a.SuperAdmin]),
        userCtrl.removeRole);


};