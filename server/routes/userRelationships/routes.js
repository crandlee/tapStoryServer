"use strict";
require('require-enhanced')();

var authCtrl = global.rootRequire('ctrl-auth');
var relCtrl = global.rootRequire('ctrl-rel');
var userCtrl = global.rootRequire('ctrl-user');

module.exports = function (serverSvc) {


    //Friendships
    serverSvc.addRoute('POST', '/users/:userName/friendships',
        authCtrl.authenticateMethod(),
        authCtrl.authorizeMethod(authCtrl.currentUser),
        global._.partial(relCtrl.saveRelationship,
            { rel: 'friend', status: 'pending'},
            { rel: 'friend', status: 'pendingack'}, {}));

    serverSvc.addRoute('POST', '/users/:userName/friendships/acknowledgement',
        authCtrl.authenticateMethod(),
        authCtrl.authorizeMethod(authCtrl.currentUser),
        global._.partial(relCtrl.saveRelationship,
            { rel: 'friend', status: 'active'},
            { rel: 'friend', status: 'active'}, {updateOnly: true}));

    serverSvc.addRoute('DEL', '/users/:userName/friendships',
        authCtrl.authenticateMethod(),
        authCtrl.authorizeMethod(authCtrl.adminRolesOrCurrent),
        global._.partial(relCtrl.saveRelationship,
            { rel: 'friend', status: 'inactive'},
            { rel: 'friend', status: 'inactive'}, {}));

    serverSvc.addRoute('GET', '/users/:userName/friendships',
        authCtrl.authenticateMethod(),
        authCtrl.authorizeMethod(authCtrl.adminRolesOrCurrent),
        global._.partial(relCtrl.getRelationships, 'friend'));

    serverSvc.addRoute('GET', '/users/:userName/friendships/:relUser',
        authCtrl.authenticateMethod(),
        authCtrl.authorizeMethod(authCtrl.adminRolesOrCurrent),
        userCtrl.getUser);



    //Guardian


    //Surrogate



};