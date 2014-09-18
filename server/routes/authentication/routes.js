"use strict";
var cb = require('common-bundle')();

var authCtrl = cb.rootRequire('ctrl-auth');
var userCtrl = cb.rootRequire('ctrl-user');
var enums = cb.enums;
var passport = require('passport');

module.exports = function (serverSvc) {


    //User
    serverSvc.addRoute(enums.routeMethods.GET, '/users',
        authCtrl.authorizeMethod(authCtrl.adminRoles),
        userCtrl.getUsers);
    serverSvc.addRoute(enums.routeMethods.POST, '/users',
        authCtrl.authorizeMethod(authCtrl.adminRoles),
        userCtrl.saveUser({addOnly: true}));
    serverSvc.addRoute(enums.routeMethods.GET, '/users/:userName',
        authCtrl.authorizeMethod(authCtrl.adminRolesCurrentUserOrRelated),
        userCtrl.getUser);
    serverSvc.addRoute(enums.routeMethods.PUT, '/users/:userName',
        authCtrl.authorizeMethod(authCtrl.adminRolesCurrentAdultOrGuardian),
        userCtrl.saveUser({addOnly: false}));
    serverSvc.addRoute(enums.routeMethods.DEL, '/users/:userName',
        authCtrl.authorizeMethod(authCtrl.adminRolesCurrentUserOrGuardian),
        userCtrl.deactivateUser);
    serverSvc.addRoute(enums.routeMethods.POST, '/users/:userName/activation',
        authCtrl.authorizeMethod(cb.extend({ allowInactive: { val: true } }, authCtrl.adminRolesCurrentUserOrGuardian)),
        userCtrl.activateUser);

    //Roles
    serverSvc.addRoute(enums.routeMethods.GET, '/users/:userName/roles',
        authCtrl.authorizeMethod(authCtrl.adminRoles),
        userCtrl.getRoles);

    serverSvc.addRoute(enums.routeMethods.POST, '/users/:userName/roles',
        authCtrl.authorizeMethod(authCtrl.superAdmin),
        userCtrl.addRole);
    serverSvc.addRoute(enums.routeMethods.DEL, '/users/:userName/roles',
        authCtrl.authorizeMethod(authCtrl.adminRoles),
        userCtrl.removeRole);


};