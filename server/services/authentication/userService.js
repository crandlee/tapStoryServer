"use strict";
var cb = require('common-bundle')();
var _ = cb._;
var errSvc = cb.errSvc;
var promise = cb.Promise;

var resSvc = cb.rootRequire('svc-resource');
var userSvcOptions = cb.rootRequire('svc-opts-user');

function save(updateProperties, options) {

    options = cb.extend(options, updateProperties);
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

function deactivate(userName, options) {

    return resSvc.processDocumentSave(
        { userName: userName },
        userSvcOptions.setDeactivateOptions, options);
}

function activate(userName, options) {

    return resSvc.processDocumentSave(
        { userName: userName },
        userSvcOptions.setActivateOptions, options);

}

function getList(find, options) {

    find = cb.extend(find, { isActive: true });
    return resSvc.getList(cb.extend(options, { modelName: 'User', find: find }));

}

function getSingle(userName, options) {

    options = options || {};
    var find = { userName: userName };
    if (!options.allowInactive) find.isActive = true;

    return resSvc.getSingle(cb.extend(options, { modelName: 'User', find: find }));

}

function getFileGroups(userName, options) {

    function getFileGroupsFromUserResource(options, user) {
        var groups = user.fileGroups || [];
        if (options.groupId) {
            groups = (_.find(groups, function(fileGroup) {
                return fileGroup.groupId === options.groupId;
            }));
            groups = groups ? [groups] : [];
        }
        return groups;
    }

    return getSingle(userName, options)
        .then(_.partial(getFileGroupsFromUserResource, options))
        .fail(errSvc.promiseError("Could not retrieve file groups from user",
            { userName: userName } ));
}

function getPermittedFiles(currentUser, groupId, file) {

    var checkGroupOwnership = promise.fbind(function(resource, groupId) {
        var fg = resource.getFileGroup(groupId);
        fg = fg || { files: [] };
        if (file)
            return { user: resource, files: [_.find(fg.files, function(testFile) {
                return testFile.fileName.toLowerCase() === file.toLowerCase();
            })] || [] };
        else
            return { user: resource, files: fg.files || []};
    });

    var checkCurrentUserRole = promise.fbind(function(resFileStruct, currentUser) {

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
                .fail(errSvc.promiseError("Could not locate user for file group"),
                    { groupId: groupId });
        } else {
            return resFileStruct;
        }

    });

    return getSingle(currentUser.userName)
        .then(_.partialRight(checkGroupOwnership, groupId))
        .then(_.partialRight(checkCurrentUserRole, currentUser))
        .then(function(userFileStruct) {
            if (userFileStruct.files.length === 0) throw new Error('Unable to authorize user for download');
            delete userFileStruct.resource;
            return promise(userFileStruct.files);
        });

}

module.exports = {
    save: save,
    getSingle: getSingle,
    getList: getList,
    activate: activate,
    deactivate: deactivate,
    addRole: addRole,
    removeRole: removeRole,
    addFiles: addFiles,
    removeFileGroup: removeFileGroup,
    removeFile: removeFile,
    getFileGroups: getFileGroups,
    getPermittedFiles:getPermittedFiles,
    optionsBuilder: userSvcOptions
};