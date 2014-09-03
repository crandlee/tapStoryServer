"use strict";
require('require-enhanced')();

var authCtrl = global.rootRequire('ctrl-auth');
var relCtrl = global.rootRequire('ctrl-rel');

module.exports = function (serverSvc) {

    serverSvc.addRoute('POST', '/users/:userName/relationships',
        authCtrl.authenticateMethod(),
        relCtrl.saveRelationship);

    serverSvc.addRoute('GET', '/users/:userName/relationships',
        authCtrl.authenticateMethod(),
        relCtrl.getRelationships);

};