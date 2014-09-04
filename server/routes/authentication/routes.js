"use strict";
require('require-enhanced')();

var authCtrl = global.rootRequire('ctrl-auth');
var userCtrl = global.rootRequire('ctrl-user');

var passport = require('passport');

module.exports = function (serverSvc) {


    //User
    serverSvc.addRoute('GET', '/users',
        authCtrl.authenticateMethod(),
        authCtrl.authorizeMethod(authCtrl.adminRoles),
        userCtrl.getUsers);
    serverSvc.addRoute('POST', '/users',
        authCtrl.authenticateMethod(),
        authCtrl.authorizeMethod(authCtrl.adminRoles),
        userCtrl.saveUser({addOnly: true}));
    serverSvc.addRoute('PUT', '/users',
        authCtrl.authenticateMethod(),
        authCtrl.authorizeMethod(authCtrl.adminRoles),
        userCtrl.saveUser({addOnly: false}));
    serverSvc.addRoute('GET', '/users/:userName',
        authCtrl.authenticateMethod(),
        authCtrl.authorizeMethod(authCtrl.currentUser),
        userCtrl.getUser);
    serverSvc.addRoute('PUT', '/users/:userName',
        authCtrl.authenticateMethod(),
        authCtrl.authorizeMethod(authCtrl.adminRolesOrCurrent),
        userCtrl.saveUser({addOnly: false}));

    //Roles
    serverSvc.addRoute('GET', '/users/:userName/roles',
        authCtrl.authenticateMethod(),
        authCtrl.authorizeMethod(authCtrl.currentUser),
        userCtrl.getRoles);

    serverSvc.addRoute('POST', '/users/:userName/roles',
        authCtrl.authenticateMethod(),
        authCtrl.authorizeMethod(authCtrl.superAdmin),
        userCtrl.addRole);
    serverSvc.addRoute('DEL', '/users/:userName/roles',
        authCtrl.authenticateMethod(authCtrl.adminRoles),
        userCtrl.removeRole);


};