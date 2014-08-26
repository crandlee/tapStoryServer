"use strict";
require('require-enhanced')();

var resourceSvc = global.rootRequire('svc-resource');
var userSvcOptions = global.rootRequire('svc-opts-user');

function save(updateProperties, options) {

    options = global.extend(options, updateProperties);
    return resourceSvc.processResourceSave(null, userSvcOptions.setSaveUserOptions, options);

}

function addRole(userName, newRole, options) {

    return resourceSvc.processResourceSave({ userName: userName, role: newRole},
        userSvcOptions.setAddRoleOptions, options);
}

function removeRole(userName, existRole, options) {

    return resourceSvc.processResourceSave({ userName: userName, role: existRole},
        userSvcOptions.setRemoveRoleOptions, options);

}

function addFiles(userName, fileNames, groupId, options) {

    return resourceSvc.processResourceSave({ userName: userName, file: fileNames, groupId: groupId},
        userSvcOptions.setAddFileOptions, options);

}

function removeFile(userName, fileName, groupId, options) {

    return resourceSvc.processResourceSave({ userName: userName, file: fileName, groupId: groupId},
        userSvcOptions.setRemoveFileOptions, options);

}


function getList(query, options) {

    return resourceSvc.getList(global.extend(options, { modelName: 'User', query: query }));

}

function getSingle(userName, options) {

    return resourceSvc.getSingle(global.extend(options, { modelName: 'User', query: {userName: userName} }));

}

function getFileGroups(userName, options) {

    function getFileGroupsFromUserResource(user) {
        return user.fileGroup || [];
    }

    return getSingle(userName, options)
        .then(getFileGroupsFromUserResource)
        .fail(global.errSvc.promiseError("Could not retrieve file groups from user",
            { userName: userName } ));
}

module.exports = {
    save: save,
    getSingle: getSingle,
    getList: getList,
    addRole: addRole,
    removeRole: removeRole,
    addFiles: addFiles,
    removeFile: removeFile,
    getFileGroups: getFileGroups,
    optionsBuilder: userSvcOptions
};