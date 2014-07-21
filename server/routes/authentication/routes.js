var authCtrl = require('../../controllers/authentication/authCtrl');
var passport = require('passport');

module.exports = function(serverSvc) {

    serverSvc.addRoute('GET', '/login', authCtrl.authenticateMethod(), authCtrl.authenticate);

};