"use strict";
var cb = require('common-bundle')();
var _ = cb._;

var authMdl = cb.rootRequire('mdl-auth');
var relCtrlExt = cb.rootRequire('ctrl-rel-ext');
var enums = cb.enums;
var a = enums.auth;
var rs = cb.rootRequire('route-builder')();

module.exports = function () {


    //Friendships
    rs.getResource('user')
        .addResource({ uri: 'friendships' })
            .addMethod(rs.resourceMethods.GET,
                authMdl.authorize([a.Admin, a.CurrentAny, a.StrictGuardian]), relCtrlExt.getFriendships)
            .addMethod(rs.resourceMethods.POST,
                authMdl.authorize([a.CurrentAdult, a.StrictGuardian]), relCtrlExt.addFriendship)
            .addMethod(rs.resourceMethods.DEL,
                authMdl.authorize([a.Admin, a.CurrentAny, a.NonStrictGuardian]), relCtrlExt.deactivateFriendship)
        .addResource({ uri: 'acknowledgement' })
            .addMethod(rs.resourceMethods.POST,
                authMdl.authorize([a.CurrentAdult, a.StrictGuardian]), relCtrlExt.acknowledgeFriendship);

    //Guardianships/Guardians
    rs.getResource('user')
        .addResource({ uri: 'guardianships'})
            .addMethod(rs.resourceMethods.GET,
                authMdl.authorize([a.Admin, a.CurrentAdult]), relCtrlExt.getGuardianships)
            .addMethod(rs.resourceMethods.POST,
                authMdl.authorize([a.CurrentAdult]), relCtrlExt.addGuardianship);


    rs.getResource('user')
        .addResource({ uri: 'guardians'})
            .addMethod(rs.resourceMethods.GET,
                authMdl.authorize([a.Admin, a.CurrentChild, a.NonStrictGuardian]), relCtrlExt.getGuardianships)
            .addMethod(rs.resourceMethods.POST,
                authMdl.authorize([a.StrictGuardian]), relCtrlExt.addAdditionalGuardian)
            .addMethod(rs.resourceMethods.DEL,
                authMdl.authorize([a.StrictOneOfMultipleGuardians]), relCtrlExt.deactivateGuardianship);


};