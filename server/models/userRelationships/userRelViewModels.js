'use strict';
var cb = require('common-bundle')();
var _ = cb._;

function getBaseRelationshipVm(relDoc, sourceName) {

    var relPart = _.find(relDoc.participants, function (user) {
        return user.user.userName.toLowerCase() !== sourceName.toLowerCase();
    });

    return {
        userName: relPart.user.userName,
        firstName: relPart.user.firstName,
        lastName: relPart.user.lastName,
        relationship: relPart.rel,
        status: relPart.status
    }
}
function getRelationshipViewModel(relDoc, options) {

    return getBaseRelationshipVm(relDoc, options.sourceName);

}

module.exports =  {
    relationship: getRelationshipViewModel
};