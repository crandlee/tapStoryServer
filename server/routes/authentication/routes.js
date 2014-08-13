"use strict";
require('require-enhanced')();

var authCtrl = global.rootRequire('ctrl-auth');
var userCtrl = global.rootRequire('ctrl-user');
var passport = require('passport');

module.exports = function(serverSvc) {


    //User
    serverSvc.addRoute('POST', '/user',
        authCtrl.authenticateMethod(),
        userCtrl.saveUser({addOnly: true}));
    serverSvc.addRoute('POST', '/users',
        authCtrl.authenticateMethod(),
        authCtrl.authorizeMethod('admin'),
        userCtrl.saveUser({addOnly: true}));
    serverSvc.addRoute('PUT', '/user',
        authCtrl.authenticateMethod(),
        authCtrl.authorizeMethod('admin'),
        userCtrl.saveUser({addOnly: false}));
    serverSvc.addRoute('GET', '/user/:userName',
        authCtrl.authenticateMethod(),
        userCtrl.getUser);
    serverSvc.addRoute('GET', '/users',
        authCtrl.authenticateMethod(),
        authCtrl.authorizeMethod('admin'),
        userCtrl.getUsers);

    //Roles
    serverSvc.addRoute('POST', '/user/:userName/role',
        authCtrl.authenticateMethod(),
        userCtrl.addRole);
    serverSvc.addRoute('DEL', '/user/:userName/role',
        authCtrl.authenticateMethod(),
        userCtrl.removeRole);
    serverSvc.addRoute('GET', '/user/:userName/roles',
        authCtrl.authenticateMethod(),
        userCtrl.getRoles);


};