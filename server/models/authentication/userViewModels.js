'use strict';
var cb = require('common-bundle')();


function getBaseUserVm(userDoc) {
    return {
        firstName: userDoc.firstName,
        lastName: userDoc.lastName,
        userName: userDoc.userName,
        isMinor: !!userDoc.isMinor,
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


function getUserVm(userDoc) {

    return getBaseUserVm(userDoc);

}

function getFileGroupVm(fgDoc) {

    return getBaseFileGroupVm(fgDoc);

}

module.exports = {

    user: getUserVm,
    fileGroup: getFileGroupVm

};