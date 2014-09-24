"use strict";
var cb = require('common-bundle')();
var _ = cb._;

var relCtrlExt = cb.rootRequire('ctrl-rel-ext');
var enums = cb.enums;
var a = enums.auth;
var rs = cb.rootRequire('route-builder')();

module.exports = function () {


    //Friendships
    rs.getResource('user')
        .addResource({ uri: 'friendships' })
            .addMethod(rs.resourceMethods.GET,
                { rules: [a.Admin, a.CurrentAny, a.StrictGuardian]}, relCtrlExt.getFriendships, { self: true })
            .addMethod(rs.resourceMethods.POST,
                { rules: [a.CurrentAdult, a.StrictGuardian]}, relCtrlExt.addFriendship)
            .addMethod(rs.resourceMethods.DEL,
                { rules: [a.Admin, a.CurrentAny, a.NonStrictGuardian]}, relCtrlExt.deactivateFriendship)
        .addResource({ uri: 'acknowledgement' })
            .addMethod(rs.resourceMethods.POST,
                { rules: [a.CurrentAdult, a.StrictGuardian]}, relCtrlExt.acknowledgeFriendship);

    //Guardianships/Guardians
    rs.getResource('user')
        .addResource({ uri: 'guardianships'})
            .addMethod(rs.resourceMethods.GET,
                { rules: [a.Admin, a.CurrentAdult]}, relCtrlExt.getGuardianships, { self: true })
            .addMethod(rs.resourceMethods.POST,
                { rules: [a.CurrentAdult]}, relCtrlExt.addGuardianship);


    rs.getResource('user')
        .addResource({ uri: 'guardians'})
            .addMethod(rs.resourceMethods.GET,
                { rules: [a.Admin, a.CurrentChild, a.NonStrictGuardian]}, relCtrlExt.getGuardianships, { self: true })
            .addMethod(rs.resourceMethods.POST,
                { rules: [a.StrictGuardian]}, relCtrlExt.addAdditionalGuardian)
            .addMethod(rs.resourceMethods.DEL,
                { rules: [a.StrictOneOfMultipleGuardians]}, relCtrlExt.deactivateGuardianship);


};