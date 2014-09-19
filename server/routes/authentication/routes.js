"use strict";
var cb = require('common-bundle')();

var authCtrl = cb.rootRequire('ctrl-auth');
var userCtrl = cb.rootRequire('ctrl-user');
var enums = cb.enums;

module.exports = function (serverSvc) {


    //Retrieve All Users - Admins
    //Authorize: Admins
    serverSvc.addRoute(enums.routeMethods.GET, '/users',
        authCtrl.authorize(authCtrl.adminRoles),
        userCtrl.getUsers);

    //Add New User
    //Authorize: Admins/Guest
    //TODO-Randy: Add guest access/require acknowledgement of new user with anti-DDOS
    serverSvc.addRoute(enums.routeMethods.POST, '/users',
        authCtrl.authorize(authCtrl.adminRoles),
        userCtrl.saveUser({addOnly: true}));

    //Get User
    //Authorize: Admins/CurrentAny/Relationships
    serverSvc.addRoute(enums.routeMethods.GET, '/users/:userName',
        authCtrl.authorize(authCtrl.adminRolesCurrentUserOrRelated),
        userCtrl.getUser);

    //Update User
    //Authorize: Admins/CurrentAdult/NoChild:StrictGuardian
    serverSvc.addRoute(enums.routeMethods.PUT, '/users/:userName',
        authCtrl.authorize(authCtrl.adminRolesCurrentAdultOrGuardian),
        userCtrl.saveUser({addOnly: false}));

    //Delete User
    //Authorize: Admins/CurrentAdult/CurrentChild:NonStrictGuardian
    //TODO-Randy: Delete relationship when user becomes inactive
    serverSvc.addRoute(enums.routeMethods.DEL, '/users/:userName',
        authCtrl.authorize(authCtrl.adminRolesCurrentUserOrGuardian),
        userCtrl.deactivateUser);

    //Re-Activate User
    //Authorize: Admins/Guest
    serverSvc.addRoute(enums.routeMethods.POST, '/users/:userName/activation',
        authCtrl.authorize(cb.extend({ allowInactive: { val: true } }, authCtrl.adminRolesCurrentUserOrGuardian)),
        userCtrl.activateUser);

    //Get Roles
    //Authorize: Admins
    serverSvc.addRoute(enums.routeMethods.GET, '/users/:userName/roles',
        authCtrl.authorize(authCtrl.adminRoles),
        userCtrl.getRoles);

    //Add Roles
    //Authorize: Super-Admins
    serverSvc.addRoute(enums.routeMethods.POST, '/users/:userName/roles',
        authCtrl.authorize(authCtrl.superAdmin),
        userCtrl.addRole);

    //Remove Roles
    //Authorize: Super-Admins
    serverSvc.addRoute(enums.routeMethods.DEL, '/users/:userName/roles',
        authCtrl.authorize(authCtrl.superAdmin),
        userCtrl.removeRole);


};