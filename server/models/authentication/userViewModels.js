'use strict';
var cb = require('common-bundle')();
var linkSvc = cb.rootRequire('svc-link');


function getBaseUserVm(userDoc) {
    return {
        firstName: userDoc.firstName,
        lastName: userDoc.lastName,
        userName: userDoc.userName,
        roles: userDoc.roles
    };
}

function getBaseFileGroupVm(fgDoc) {

    return {
        groupId: fgDoc.groupId,
        groupName: fgDoc.groupName,
        files: fgDoc.files.map(function (file) {
            return { fileName: file.fileName };
        })
    };

}

function getUsersVm(userDoc, apiPath, options) {

    var vm = getBaseUserVm(userDoc);
    if (!options.hideLinks) {
        vm = linkSvc.attachLinksToObject(vm, [
            { uri: '/' + userDoc.userName, rel: 'user', isSelf: true}
        ], apiPath);
    }
    return vm;

}

function getUserVm(userDoc, apiPath, options) {

    var vm = getBaseUserVm(userDoc);
    if (!options.hideLinks) {
        var arr = [
            { uri: '', method: 'PUT', rel: 'user' },
            { uri: '/roles', rel: 'roles' },
            { uri: '/fileGroups', rel: 'fileGroups' },
            { uri: '/fileHelper', rel: 'fileHelper' }
        ];
        if (!userDoc.isMinor) {
            arr.push({ uri: '/friendships', rel: 'friendship' }, { uri: '/guardianships', rel: 'guardianship' });
        }
        vm = linkSvc.attachLinksToObject(vm, arr, apiPath);
    }
    return vm;

}

function getFileGroupVm(fgDoc, apiPath, options) {

    var vm = getBaseFileGroupVm(fgDoc);

    vm.files = vm.files.map(function (file) {
        var innerVm = file;
        if (!options.hideLinks) {
            innerVm = linkSvc.attachLinksToObject(innerVm, [
                { uri: '/' + file.fileName, rel: 'filePackage' }
            ], apiPath);
        }
        return innerVm;
    });
    return vm;
}

module.exports = {

    users: getUsersVm,
    user: getUserVm,
    fileGroup: getFileGroupVm

};