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
                { rules: [a.Admin, a.CurrentAny, a.StrictGuardian]}, relCtrlExt.getFriendships, { self: true,
                    description: 'Get friendships for <%=userName%>'})
            .addMethod(rs.resourceMethods.POST,
                { rules: [a.CurrentAdult, a.StrictGuardian]}, relCtrlExt.addFriendship, { description: 'Submit a friend request from <%=userName%>'})
            .addMethod(rs.resourceMethods.DEL,
                { rules: [a.Admin, a.CurrentAny, a.NonStrictGuardian]}, relCtrlExt.deactivateFriendship,
                    { bodyParams: [ 'userName' ], description: '<%=userName%> deactivates friendship' })
        .addResource({ uri: 'acknowledgement' })
            .addMethod(rs.resourceMethods.POST,
                { rules: [a.CurrentAdult, a.StrictGuardian]}, relCtrlExt.acknowledgeFriendship,
                    { bodyParams: [ 'userName' ], description: '<%=userName%> acknowledges friendship request' });

    //Guardianships/Guardians
    rs.getResource('user')
        .addResource({ uri: 'guardianships'})
            .addMethod(rs.resourceMethods.GET,
                { rules: [a.Admin, a.CurrentAdult]}, relCtrlExt.getGuardianships, { self: true, description: 'Get list of children that <%=userName%> is guardian of' })
            .addMethod(rs.resourceMethods.POST,
                { rules: [a.CurrentAdult]}, relCtrlExt.addGuardianship,
                    { bodyParams: [ 'userName', 'firstName', 'lastName', 'password'], description: 'Add a new child under the guardianship of <%=userName%>' });


    rs.getResource('user')
        .addResource({ uri: 'guardians'})
            .addMethod(rs.resourceMethods.GET,
                { rules: [a.Admin, a.CurrentChild, a.NonStrictGuardian]}, relCtrlExt.getGuardianships, { self: true, description: 'Get list of guardians for <%=userName%>' })
            .addMethod(rs.resourceMethods.POST,
                { rules: [a.StrictGuardian]}, relCtrlExt.addAdditionalGuardian,
                    { bodyParams: [ 'guardianUserName'], description: 'Add an additional guardian to child <%=userName%>' })
            .addMethod(rs.resourceMethods.DEL,
                { rules: [a.StrictOneOfMultipleGuardians]}, relCtrlExt.deactivateGuardianship,
                    { bodyParams: [ 'userName' ], description: 'Deactivate a guardian for child <%=userName%>.  Must have at least one guardian at the end of this operation.' });


};