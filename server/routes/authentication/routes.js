"use strict";
var cb = require('common-bundle')();

var authCtrl = cb.rootRequire('ctrl-auth');
var userCtrl = cb.rootRequire('ctrl-user');

var passport = require('passport');

module.exports = function (serverSvc) {


    //User
    serverSvc.addRoute('GET', '/users',
        authCtrl.authorizeMethod(authCtrl.adminRoles),
        userCtrl.getUsers);
    serverSvc.addRoute('POST', '/users',
        authCtrl.authorizeMethod(authCtrl.adminRoles),
        userCtrl.saveUser({addOnly: true}));
    serverSvc.addRoute('GET', '/users/:userName',
        authCtrl.authorizeMethod(authCtrl.adminRolesOrCurrent),
        userCtrl.getUser);
    serverSvc.addRoute('PUT', '/users/:userName',
        authCtrl.authorizeMethod(authCtrl.adminRolesOrCurrent),
        userCtrl.saveUser({addOnly: false}));

    //Roles
    serverSvc.addRoute('GET', '/users/:userName/roles',
        authCtrl.authorizeMethod(authCtrl.currentUser),
        userCtrl.getRoles);

    serverSvc.addRoute('POST', '/users/:userName/roles',
        authCtrl.authorizeMethod(authCtrl.superAdmin),
        userCtrl.addRole);
    serverSvc.addRoute('DEL', '/users/:userName/roles',
        authCtrl.authorizeMethod(authCtrl.adminRoles),
        userCtrl.removeRole);


};