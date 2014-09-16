"use strict";
var cb = require('common-bundle')();
var _ = cb._;

var authCtrl = cb.rootRequire('ctrl-auth');
var relCtrl = cb.rootRequire('ctrl-rel');
var userCtrl = cb.rootRequire('ctrl-user');
var enums = cb.rootRequire('enums');

module.exports = function (serverSvc) {


    //Friendships
    //Adults can create friendships by request to other adults only
    //Other adults can view pending friendship requests and can acknowledge them to make them active
    //Adults can view their active friendships and deactivate them at any time

    serverSvc.addRoute('POST', '/users/:userName/friendships',
        authCtrl.authenticateMethod(),
        authCtrl.authorizeMethod(authCtrl.currentUserAndAdult),
        _.partial(relCtrl.saveRelationship,
            { rel: enums.relationships.friend, status: enums.statuses.pending},
            { rel: enums.relationships.friend, status: enums.statuses.pendingack}, {}));

    serverSvc.addRoute('POST', '/users/:userName/friendships/acknowledgement',
        authCtrl.authenticateMethod(),
        authCtrl.authorizeMethod(authCtrl.currentUserAndAdult),
        _.partial(relCtrl.saveRelationship,
            { rel: enums.relationships.friend, status: enums.statuses.active},
            { rel: enums.relationships.friend, status: enums.statuses.active}, {updateOnly: true}));

    serverSvc.addRoute('DEL', '/users/:userName/friendships',
        authCtrl.authenticateMethod(),
        authCtrl.authorizeMethod(authCtrl.adminRolesOrCurrent),
        _.partial(relCtrl.saveRelationship,
            { rel: enums.relationships.friend, status: enums.statuses.inactive},
            { rel: enums.relationships.friend, status: enums.statuses.inactive}, {}));

    serverSvc.addRoute('GET', '/users/:userName/friendships',
        authCtrl.authenticateMethod(),
        authCtrl.authorizeMethod(authCtrl.adminRolesOrCurrent),
        _.partial(relCtrl.getRelationships, enums.relationships.friend));

    serverSvc.addRoute('GET', '/users/:userName/friendships/:relUser',
        authCtrl.authenticateMethod(),
        authCtrl.authorizeMethod(authCtrl.adminRolesOrCurrent),
        userCtrl.getUser);



    //Guardian
    //Adults can add new children accounts which are immediately active
    //Guardians can view all of their children and the existing relationships of their children
    //Guardians can add friendships for their children.
    //Guardians can add other guardians to their children.
    //Guardians can deactivate friendships for their children.
    //Guardians can remove child accounts

    serverSvc.addRoute('POST', '/users/:userName/guardianships',
        authCtrl.authenticateMethod(),
        authCtrl.authorizeMethod(authCtrl.currentUserAndAdult),
        _.partial(relCtrl.saveRelationship,
            { rel: enums.relationships.guardian, status: enums.statuses.active},
            { rel: enums.relationships.child, status: enums.statuses.active}, { addSubordinate: true }));

    serverSvc.addRoute('GET', '/users/:userName/guardianships',
        authCtrl.authenticateMethod(),
        authCtrl.authorizeMethod(authCtrl.adminRolesOrCurrent),
        _.partial(relCtrl.getRelationships, enums.relationships.guardian));

    serverSvc.addRoute('GET', '/users/:userName/guardianships/:relUser',
        authCtrl.authenticateMethod(),
        authCtrl.authorizeMethod(authCtrl.adminRolesOrCurrent),
        userCtrl.getUser);



};