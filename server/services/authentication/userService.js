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

function addFileGroupShare(userName, groupId, targetUser, options) {

    return resSvc.processDocumentSave(
        { userName: userName, groupId: groupId, targetUser: targetUser },
        userSvcOptions.setAddShareGroupOptions, options);

}

function removeFileGroupShare(userName, groupId, targetUser, options) {

    return resSvc.processDocumentSave(
        { userName: userName, groupId: groupId, targetUser: targetUser },
        userSvcOptions.setRemoveShareGroupOptions, options);

}

function getShares(userName, groupId, sharedUser, currentUser) {

    var userRelSvc = cb.rootRequire('svc-rel');
    var hasRelationship = function(sourceUser, targetUser, rels) {
        return _.filter(rels, function(rel) {
            return (!currentUser || currentUser === sourceUser || currentUser === targetUser)
                &&  rel.participants.length === 2
                && ((rel.relKey === sourceUser.toLowerCase() + '||' + targetUser.toLowerCase())
                    || rel.relKey === targetUser.toLowerCase() + '||' + sourceUser.toLowerCase())
                && rel.participants[0].status === cb.enums.statuses.active && rel.participants[1].status === cb.enums.statuses.active;
        }).length > 0;
    };

    var getShares = function(user) {
        if (sharedUser && !user) return cb.Promise(null);
        var opts = {};
        opts.find = { userName: userName };
        if (groupId) opts.find["fileGroups.groupId"] = groupId;
        if (sharedUser) opts.find["fileGroups.shares.userName"] = user.userName;
        if (groupId)
            opts.select = { "fileGroups.$": 1 };
        else
            opts.select = { "fileGroups": 1 };
        opts.modelName = 'User';
        return resSvc.getSingle(opts)
            .then(function(user) {
                return userRelSvc.getRelationships(userName, null, cb.enums.statuses.active)
                    .then(function(rels) {
                        if (!user) return cb.Promise(null);
                        return cb.Promise(_(user.fileGroups).map(function(fg) {
                            return { groupName: fg.groupName, files: _.pluck(fg.files, 'fileName'),
                                users: _(fg.shares).filter(function(share)
                                { return hasRelationship(userName, share.userName, rels)
                                    && (!sharedUser || share.userName === sharedUser) }).pluck('userName').value() };
                        }).filter(function(fg) { return fg.users.length > 0 }).value());
                    });

            });
    };

    if (sharedUser) return getSingle(sharedUser).then(getShares);
    return getShares(null);

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

    find = cb.extend({ isActive: true }, find);
    return resSvc.getList(cb.extend({ modelName: 'User', find: find }, options));

}

function getSingle(userName, options) {

    options = options || {};
    var find = { userName: userName };
    if (!options.allowInactive) find.isActive = true;
    return resSvc.getSingle(cb.extend({ modelName: 'User', find: find }, options));

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
    addFileGroupShare: addFileGroupShare,
    removeFileGroupShare: removeFileGroupShare,
    getShares: getShares,
    optionsBuilder: userSvcOptions
};