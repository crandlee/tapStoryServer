'use strict';
require('require-enhanced')();
var linkSvc = global.rootRequire('svc-link');

function getBaseUserVm(userDoc){
    return {
    id: userDoc.id,
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
        files: fgDoc.files.map(function(file) {
           return { fileName: file.fileName };
        })
    };

}

function getUsersVm(userDoc, apiPath) {

    return linkSvc.attachLinksToObject(getBaseUserVm(userDoc), [
        { uri: '/' + userDoc.userName, rel: 'user', isSelf: true}
    ], apiPath);

}

function getUserVm(userDoc, apiPath) {

    return linkSvc.attachLinksToObject(getBaseUserVm(userDoc), [
        { uri: '/roles', rel: 'roles' },
        { uri: '/fileGroups', rel: 'fileGroups' },
        { uri: '/fileGroups', rel: 'fileGroup', method: 'DELETE' },
        { uri: '/fileHelper', rel: 'fileHelper' }
    ], apiPath);

}

function getFileGroupVm(fgDoc, apiPath) {

    var vm = getBaseFileGroupVm(fgDoc);
    vm.files = vm.files.map(function(file) {
        return linkSvc.attachLinksToObject(file ,[
            { uri: '/' + file.fileName, rel: 'filePackage' }
        ], apiPath);
    });
    return vm;
}

module.exports =  {

    users: getUsersVm,
    user: getUserVm,
    fileGroup: getFileGroupVm

};