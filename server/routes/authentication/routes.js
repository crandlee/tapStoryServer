"use strict";
var cb = require('common-bundle')();

var userCtrl = cb.rootRequire('ctrl-user');
var enums = cb.enums;
var a = enums.auth;
var rs = cb.rootRequire('route-builder')();

module.exports = function () {


    //TODO-Randy: Add guest access/require acknowledgement of new user with anti-DDOS

    //Users list operations
    var userRes = rs.getResource('root')
        .addResource({ uri: 'users' } )
            .addMethod(rs.resourceMethods.GET,
                { rules: [a.Admin] }, userCtrl.getUsers, { self: true })
            .addMethod(rs.resourceMethods.POST,
                { rules: [a.Guest]}, userCtrl.saveUser({addOnly: true}))
        .addResource({uri: ':userName', name: 'user', rel: 'user'}, { collectionChild: true, key: 'userName' });


    //User Operations
    userRes
            .addMethod(rs.resourceMethods.GET,
                { rules: [a.Admin, a.CurrentAny, a.HasRelationship]}, userCtrl.getUser, { self: true })
            .addMethod(rs.resourceMethods.PUT,
                { rules: [a.Admin, a.CurrentAdult, a.StrictGuardian]}, userCtrl.saveUser({addOnly: false}))
            .addMethod(rs.resourceMethods.DEL,
                { rules: [a.Admin, a.CurrentAdult, a.NonStrictGuardian]}, userCtrl.deactivateUser)
        .addResource({ uri: 'activation' })
            .addMethod(rs.resourceMethods.POST,
                { rules: [a.Admin, a.CurrentAdult, a.StrictGuardian], options: { allowInactive: true }}, userCtrl.activateUser);

    //Role Operations
    userRes
        .addResource({ uri: 'roles' })
            .addMethod(rs.resourceMethods.GET,
                { rules: [a.Admin] }, userCtrl.getRoles, { self: true })
            .addMethod(rs.resourceMethods.POST,
                { rules: [a.SuperAdmin] }, userCtrl.addRole)
            .addMethod(rs.resourceMethods.DEL,
                { rules: [a.SuperAdmin] }, userCtrl.removeRole);

};