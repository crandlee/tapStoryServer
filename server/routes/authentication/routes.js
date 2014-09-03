"use strict";
require('require-enhanced')();

var authCtrl = global.rootRequire('ctrl-auth');
var userCtrl = global.rootRequire('ctrl-user');

var passport = require('passport');

module.exports = function (serverSvc) {


    //User
    serverSvc.addRoute('GET', '/users',
        authCtrl.authenticateMethod(),
        authCtrl.authorizeMethod('admin'),
        userCtrl.getUsers);
    serverSvc.addRoute('POST', '/users',
        authCtrl.authenticateMethod(),
        authCtrl.authorizeMethod('admin'),
        userCtrl.saveUser({addOnly: true}));
    serverSvc.addRoute('PUT', '/users',
        authCtrl.authenticateMethod(),
        authCtrl.authorizeMethod('admin'),
        userCtrl.saveUser({addOnly: false}));
    serverSvc.addRoute('GET', '/users/:userName',
        authCtrl.authenticateMethod(),
        userCtrl.getUser);
    serverSvc.addRoute('PUT', '/users/:userName',
        authCtrl.authenticateMethod(),
        authCtrl.authorizeMethod('admin'),
        userCtrl.saveUser({addOnly: false}));

    //Roles
    serverSvc.addRoute('GET', '/users/:userName/roles',
        authCtrl.authenticateMethod(),
        userCtrl.getRoles);

    serverSvc.addRoute('POST', '/users/:userName/roles',
        authCtrl.authenticateMethod(),
        userCtrl.addRole);
    serverSvc.addRoute('DEL', '/users/:userName/roles',
        authCtrl.authenticateMethod(),
        userCtrl.removeRole);


};