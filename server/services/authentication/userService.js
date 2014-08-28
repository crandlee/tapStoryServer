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

function addFiles(userName, fileNames, groupId, groupName, options) {

    return resourceSvc.processResourceSave(
        { userName: userName, file: fileNames, groupId: groupId, groupName: groupName },
        userSvcOptions.setAddFileOptions, options);

}

function removeFile(userName, fileName, groupId, options) {

    return resourceSvc.processResourceSave(
        { userName: userName, file: fileName, groupId: groupId},
        userSvcOptions.setRemoveFileOptions, options);

}

function removeFileGroup(userName, groupId, options) {

    return resourceSvc.processResourceSave(
        { userName: userName, groupId: groupId},
        userSvcOptions.setRemoveFileGroupOptions, options);

}

function getList(query, options) {

    return resourceSvc.getList(global.extend(options, { modelName: 'User', query: query }));

}

function getSingle(userName, options) {

    return resourceSvc.getSingle(global.extend(options, { modelName: 'User', query: {userName: userName} }));

}

function getFileGroups(userName, options) {

    function getFileGroupsFromUserResource(options, user) {
        var groups = user.fileGroups || [];
        if (options.groupId) {
            groups = (global._.find(groups, function(fileGroup) {
                return fileGroup.groupId === options.groupId;
            }));
            groups = groups ? [groups] : [];
        }
        return groups;
    }

    return getSingle(userName, options)
        .then(global._.partial(getFileGroupsFromUserResource, options))
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
    removeFileGroup: removeFileGroup,
    removeFile: removeFile,
    getFileGroups: getFileGroups,
    optionsBuilder: userSvcOptions
};