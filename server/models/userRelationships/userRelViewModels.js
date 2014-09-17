'use strict';
var cb = require('common-bundle')();
var _ = cb._;
var linkSvc = cb.rootRequire('svc-link');

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
function getRelationshipViewModel(relDoc, apiPath, options) {

    var vm = getBaseRelationshipVm(relDoc, options.sourceName);
    if (!options.hideLinks) {
        vm = linkSvc.attachLinksToObject(vm,
            [{ uri: '/' + encodeURIComponent(vm.userName), rel: 'relUser' }],
            apiPath);
    }
    return vm;

}

module.exports =  {
    relationship: getRelationshipViewModel
};