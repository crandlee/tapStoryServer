"use strict";
require('require-enhanced')();

var resSvc = global.rootRequire('svc-resource');
var userSvcOptions = global.rootRequire('svc-opts-user');

function save(updateProperties, options) {

    options = global.extend(options, updateProperties);
    return resSvc.processDocumentSave(null, userSvcOptions.setSaveUserOptions, options);

}

function addRole(userName, newRole, options) {

    return resSvc.processDocumentSave({ userName: userName, role: newRole},
        userSvcOptions.setAddRoleOptions, options);
}

function removeRole(userName, existRole, options) {

    return resSvc.processDocumentSave({ userName: userName, role: existRole},
        userSvcOptions.setRemoveRoleOptions, options);

}

function addFiles(userName, fileNames, groupId, groupName, options) {

    return resSvc.processDocumentSave(
        { userName: userName, file: fileNames, groupId: groupId, groupName: groupName },
        userSvcOptions.setAddFileOptions, options);

}

function removeFile(userName, fileName, groupId, options) {

    return resSvc.processDocumentSave(
        { userName: userName, file: fileName, groupId: groupId},
        userSvcOptions.setRemoveFileOptions, options);

}

function removeFileGroup(userName, groupId, options) {

    return resSvc.processDocumentSave(
        { userName: userName, groupId: groupId},
        userSvcOptions.setRemoveFileGroupOptions, options);

}

function getList(find, options) {

    return resSvc.getList(global.extend(options, { modelName: 'User', find: find }));

}

function getSingle(userName, options) {

    return resSvc.getSingle(global.extend(options, { modelName: 'User', find: {userName: userName} }));

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

function getPermittedFiles(currentUser, groupId, file) {

    var checkGroupOwnership = global.Promise.fbind(function(resource, groupId) {
        var fg = resource.getFileGroup(groupId);
        fg = fg || { files: [] };
        if (file)
            return { user: resource, files: [global._.find(fg.files, function(testFile) {
                return testFile.fileName.toLowerCase() === file.toLowerCase();
            })] || [] };
        else
            return { user: resource, files: fg.files || []};
    });

    var checkCurrentUserRole = global.Promise.fbind(function(resFileStruct, currentUser) {

        if (resFileStruct.files.length === 0 && currentUser.hasRole('super-admin')) {
            return getSingle({ "fileGroups.groupId" : groupId })
                .then(function(resource) {
                    if (resource) {
                        var fg = resource.getFileGroup(groupId);
                        resFileStruct.files = (fg && fg.files);
                    } else {
                        resFileStruct.files =  [];
                    }
                    return resFileStruct;
                })
                .fail(global.errSvc.promiseError("Could not locate user for file group"),
                    { groupId: groupId });
        } else {
            return resFileStruct;
        }

    });

    return getSingle(currentUser.userName)
        .then(global._.partialRight(checkGroupOwnership, groupId))
        .then(global._.partialRight(checkCurrentUserRole, currentUser))
        .then(function(userFileStruct) {
            if (userFileStruct.files.length === 0) throw new Error('Unable to authorize user for download');
            delete userFileStruct.resource;
            return global.Promise(userFileStruct.files);
        });

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
    getPermittedFiles:getPermittedFiles,
    optionsBuilder: userSvcOptions
};