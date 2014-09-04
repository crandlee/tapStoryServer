'use strict';
require('require-enhanced')();
var linkSvc = global.rootRequire('svc-link');


function getBaseRelationshipVm(relDoc) {

    return {
        firstName: relDoc.relUser.firstName,
        lastName: relDoc.relUser.lastName,
        userName: relDoc.relUser.userName,
        relationship: relDoc.relationship,
        relStatus: relDoc.relStatus
    }
}
function getRelationshipViewModel(relDoc, apiPath) {

    var vm = getBaseRelationshipVm(relDoc);
    return vm;

}

module.exports =  {
    relationship: getRelationshipViewModel
};