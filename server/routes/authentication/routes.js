var authCtrl = require('../../controllers/authentication/authCtrl');
var userCtrl = require('../../controllers/authentication/userCtrl');
var passport = require('passport');

module.exports = function(serverSvc) {

    //Login
    serverSvc.addRoute('GET', '/login',
        authCtrl.authenticateMethod(), authCtrl.authenticate);

    //User
    serverSvc.addRoute('POST', '/user',
        authCtrl.authenticateMethod(), userCtrl.saveUser({addOnly: true}));

    serverSvc.addRoute('PUT', '/user', userCtrl.saveUser({addOnly: false}));
    serverSvc.addRoute('GET', '/user/:userName', userCtrl.getUser);
    serverSvc.addRoute('GET', '/users', userCtrl.getUsers);
    serverSvc.addRoute('POST', '/user/:userName/role', userCtrl.addRole);
    serverSvc.addRoute('DEL', '/user/:userName/role', userCtrl.removeRole);
    serverSvc.addRoute('GET', '/user/:userName/roles', userCtrl.getRoles);


};