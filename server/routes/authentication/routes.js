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
                { rules: [a.Admin] }, userCtrl.getUsers, { self: true, description: 'Retrieves all users' })
            .addMethod(rs.resourceMethods.POST,
                { rules: [a.Guest]}, userCtrl.saveUser({addOnly: true}),
                    { bodyParams: [ 'userName', 'firstName', 'lastName', 'password'], description:'Save a user' })
        .addResource({uri: ':userName', name: 'user', rel: 'user'}, { collectionChild: true, key: 'userName' });


    //User Operations
    userRes
            .addMethod(rs.resourceMethods.GET,
                { rules: [a.Admin, a.CurrentAny, a.HasRelationship]}, userCtrl.getUser, { self: true,
                 description: 'Retrieve data for the user <%=userName%>'})
            .addMethod(rs.resourceMethods.PUT,
                { rules: [a.Admin, a.CurrentAdult, a.StrictGuardian]}, userCtrl.saveUser({addOnly: false}),
                    { description: 'Update <%=userName%>',
                        bodyParams: [ { name: 'firstName', required: false }, { name: 'lastName', required: false }, { name: 'password', required: false }] })
            .addMethod(rs.resourceMethods.DEL,
                { rules: [a.Admin, a.CurrentAdult, a.NonStrictGuardian]}, userCtrl.deactivateUser, { description: 'Deactivate <%=userName%>'})
        .addResource({ uri: 'activation' })
            .addMethod(rs.resourceMethods.POST,
                { rules: [a.Admin, a.CurrentAdult, a.StrictGuardian], options: { allowInactive: true }}, userCtrl.activateUser, { description: 'Reactivate <%=userName%>'});

    //Role Operations
    userRes
        .addResource({ uri: 'roles' })
            .addMethod(rs.resourceMethods.GET,
                { rules: [a.Admin] }, userCtrl.getRoles, { self: true, description: 'Get roles for <%=userName%>' })
            .addMethod(rs.resourceMethods.POST,
                { rules: [a.SuperAdmin] }, userCtrl.addRole, { bodyParams: ['role'], description: 'Add a new role to <%=userName%>'})
            .addMethod(rs.resourceMethods.DEL,
                { rules: [a.SuperAdmin] }, userCtrl.removeRole, { bodyParams: ['role'], description: 'Remove an existing role from <%=userName%>' });

};