"use strict";
var cb = require('common-bundle')();

var authMdl = cb.rootRequire('mdl-auth');
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
                        authMdl.authorize([a.Admin]), userCtrl.getUsers)
            .addMethod(rs.resourceMethods.POST,
                authMdl.authorize([a.Guest]), userCtrl.saveUser({addOnly: true}))
        .addResource({uri: ':userName', name: 'user', rel: 'user'});

    //User Operations
    userRes
            .addMethod(rs.resourceMethods.GET,
                        authMdl.authorize([a.Admin, a.CurrentAny, a.HasRelationship]), userCtrl.getUser)
            .addMethod(rs.resourceMethods.PUT,
                authMdl.authorize([a.Admin, a.CurrentAdult, a.StrictGuardian]), userCtrl.saveUser({addOnly: false}))
            .addMethod(rs.resourceMethods.DEL,
                authMdl.authorize([a.Admin, a.CurrentAdult, a.NonStrictGuardian]), userCtrl.deactivateUser)
        .addResource({ uri: 'activation' })
            .addMethod(rs.resourceMethods.DEL,
                authMdl.authorize([a.Admin, a.CurrentAdult, a.StrictGuardian], { allowInactive: true }), userCtrl.activateUser);

    //Role Operations
    userRes
        .addResource({ uri: 'roles' })
            .addMethod(rs.resourceMethods.GET,
                authMdl.authorize([a.Admin]), userCtrl.getRoles)
            .addMethod(rs.resourceMethods.POST,
                authMdl.authorize([a.SuperAdmin]), userCtrl.addRole)
            .addMethod(rs.resourceMethods.DEL,
                authMdl.authorize([a.SuperAdmin]), userCtrl.removeRole);

};