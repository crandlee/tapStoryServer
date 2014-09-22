"use strict";
var cb = require('common-bundle')();
var _ = cb._;
var errSvc = cb.errSvc;
var promise = cb.Promise;

var authorizeSvc = cb.rootRequire('svc-auth');
var encryptionSvc = cb.rootRequire('util-encryption');
var resSvc = cb.rootRequire('svc-resource');
var userRelSvc = cb.rootRequire('svc-rel');
var enums = cb.enums;

function saveUserOptions(opts) {

    opts.preValidation = function(opts, document) {
        if (!(!!document)) {
            if (!opts.userName) errSvc.error('Saving a user requires user name');
            if (!opts.password) errSvc.error('Saving a user requires a password');
            if (!opts.firstName) errSvc.error('Saving a user requires a first name');
            if (!opts.lastName) errSvc.error('Saving a user requires a last name');
        }
        return opts;
    };
    opts.onNew = {
        roles: 'user'
    };
    opts.modelName = 'User';
    opts.find = { userName: opts.userName };
    opts.buildDocument = function(opts, doc) {

        if (opts.firstName) doc.firstName = opts.firstName;
        if (opts.lastName) doc.lastName = opts.lastName;
        if (opts.isMinor) doc.isMinor = opts.isMinor;
        if (!doc.userName) doc.userName = opts.userName;
        if (opts.password && opts.password.length > 0) {
            return encryptionSvc.saltAndHash(opts.password).then(function (token) {
                doc.userSecret = token;
                return doc;
            });
        } else {
            return doc;
        }

    };

    return opts;
}

function setFileOptions(addOrRemove, opts) {

    opts.updateOnly = true;
    opts.preValidation = promise.fbind(function(opts) {
        if (!opts.userName) errSvc.error('Adding/removing a file requires a userName');
        if (!opts.groupId) errSvc.error('Adding/removing a file requires a groupId');
        if (!opts.groupName && !opts.existing && addOrRemove !== 'remove')
            errSvc.error('Adding a file requires a groupName');
        if (!opts.file) errSvc.error('Adding files requires files for upload');
        return opts;
    });
    opts.modelName = 'User';
    opts.find = { userName: opts.userName };
    opts.manualSave = function(opts) {

        if (addOrRemove === 'remove') {
            //Remove file
            return resSvc.modelUpdate({ "userName": opts.userName, "fileGroups.groupId" : opts.groupId },
                    { $pull: { "fileGroups.$.files": { fileName: opts.file } } }, opts);
        } else {
            //Add files
            return resSvc.getSingle(opts)
                .then(function(user) {
                    user.addFiles(opts.file, opts.groupId, opts.groupName);
                    return resSvc.saveDocument(user);
                });
        }
    };

    return opts;
}

function setShareGroupOptions(addShare, opts) {

    opts.updateOnly = true;
    opts.preValidation = promise.fbind(function(opts) {
        if (!opts.userName) errSvc.error('Sharing a file group requires a userName');
        if (!opts.groupId) errSvc.error('Sharing a file group requires a groupId');
        if (!opts.targetUser) errSvc.error('Sharing a file group requires a target user');
        return resSvc.getSingle({ find: { userName: opts.targetUser }, modelName: 'User'})
            .then(function(user) {
                if (!user) errSvc.error('Could not locate the target user', { targetUser: opts.targetUser });
                opts.targetUserName = user.userName;
                return opts;
            });
    });
    opts.modelName = 'User';
    opts.find = { userName: opts.userName };
    opts.manualSave = function(opts) {
        //Add/remove share
        return resSvc.getSingle(opts)
            .then(function(user) {
                var fileGroup = (_(user.fileGroups).find(function(fg) { return fg.groupId === opts.groupId; } ));
                if (!fileGroup) errSvc.error('Could not find the file group to share', { groupId: opts.groupId });
                if (addShare) {
                    if (_(fileGroup.shares).findIndex(function(share)
                        { return share.userName.toString() === opts.targetUserName.toString(); }) === -1) {
                        fileGroup.shares.push({ userName: opts.targetUserName });
                    }
                } else {
                    fileGroup.shares.splice(_(fileGroup.shares).findIndex(function(share)
                        { return share.userName.toString() === opts.targetUserName.toString(); }), 1);
                }
                return resSvc.saveDocument(user);
            });
    };

    return opts;
}

function setRemoveFileGroupOptions(opts) {

    opts.preValidation = promise.fbind(function(opts) {
        if (!opts.userName) errSvc.error('Removing a file group requires a userName', {});
        if (!opts.groupId) errSvc.error('Removing a file group requires a groupId', {});
        return opts;
    });
    opts.modelName = 'User';
    opts.find = { userName: opts.userName };
    opts.manualSave = function(opts) {

        return resSvc.modelUpdate({ "userName" : opts.userName },
            { $pull : { "fileGroups" : { "groupId": opts.groupId } } }, opts);

    };
    return opts;
}


function setAddRoleOptions(opts) {

    opts.updateOnly = true;
    opts.role = (opts.role && opts.role.toLowerCase());
    opts.preValidation = promise.fbind(function(opts) {
        if (!opts.role) errSvc.error('Adding a role requires a role');
        if (!opts.userName) errSvc.error('Adding a role requires a userName');
        return opts;
    });
    opts.modelName = 'User';
    opts.find = { userName: opts.userName };
    opts.manualSave = function(opts) {
        if (opts.role) {
            if (!authorizeSvc.isValidRole(opts.role))
                errSvc.error('Not a valid role', { role: opts.role });
            return resSvc.modelUpdate({ "userName" : opts.userName },
                { $addToSet : { "roles" : opts.role } }, opts);
        }
    };
    return opts;
}

function setRemoveRoleOptions(opts) {

    opts.updateOnly = true;
    opts.role = (opts.role && opts.role.toLowerCase());
    opts.preValidation = function(opts) {
        if (!opts.role) errSvc.error('Removing a role requires a role');
        if (!opts.userName) errSvc.error('Removing a role requires a userName');
        return opts;
    };
    opts.modelName = 'User';
    opts.find = { userName: opts.userName };
    opts.manualSave = function(opts) {

        return resSvc.modelUpdate({ "userName" : opts.userName },
            { $pull : { "roles" : opts.role } }, opts);

    };
    return opts;

}

function setIsActive(isActive, opts) {

    var isOnlyGuardian = function(guardianName) {

        var getChildGuardianCount = function(childName) {
            return userRelSvc.getRelationships(childName, enums.relationships.child, [enums.statuses.active])
                .then(function(rels) {
                    return cb.Promise(_.reduce(rels, function(sum, rel) {
                        var retVal = (rel.participants[0].user.userName === childName && rel.participants[0].rel === enums.relationships.child ||
                                rel.participants[1].user.userName === childName && rel.participants[1].rel === enums.relationships.child)
                                    ? 1 : 0;
                        return retVal + sum;
                    }, 0));
                });
        };
        return userRelSvc.getRelationships(guardianName,
            enums.relationships.guardian, [enums.statuses.active])
            .then(function(rels) {
                var childTests = [];

                _.forEach(rels, function(rel) {
                    if (rel.participants[0].user.userName === guardianName && rel.participants[0].rel === enums.relationships.guardian)
                        childTests.push(getChildGuardianCount(rel.participants[1].user.userName));
                    if (rel.participants[1].user.userName === guardianName && rel.participants[1].rel === enums.relationships.guardian)
                        childTests.push(getChildGuardianCount(rel.participants[0].user.userName));
                });
                return cb.Promise.all(childTests)
                    .then(function(counts) {
                        console.log(counts);
                        return (_.some(counts, function(count) { return count === 1 }));
                    })
            });

    };

    opts.updateOnly = true;
    opts.preValidation = function(opts) {
        if (!opts.userName) errSvc.error('Setting user active state requires a userName');
        if (!isActive) {
            //Verify that being inactive does not leave a "child" relationship stranded
            //without a backup guardian.
            return isOnlyGuardian(opts.userName).then(function(isOnlyGuardian) {
               if (isOnlyGuardian) errSvc.error('This user is currently a sole guardian to a child.  Please add a new guardian before deactivating.')
               return opts;
            });
        } else {
            return opts;
        }
    };
    opts.modelName = 'User';
    opts.find = { userName: opts.userName };
    opts.manualSave = function(opts) {

        return resSvc.modelUpdate({ "userName" : opts.userName },
            { $set : { "isActive" : isActive } }, opts)
            .then(function(user) {
                return { isActive: user.isActive };
            });

    };
    return opts;

}

module.exports = {
    setAddFileOptions: _.partial(setFileOptions, 'add'),
    setRemoveFileOptions: _.partial(setFileOptions, 'remove'),
    setAddRoleOptions: setAddRoleOptions,
    setRemoveRoleOptions: setRemoveRoleOptions,
    setRemoveFileGroupOptions: setRemoveFileGroupOptions,
    setSaveUserOptions: saveUserOptions,
    setAddShareGroupOptions: _.partial(setShareGroupOptions, true),
    setRemoveShareGroupOptions: _.partial(setShareGroupOptions, false),
    setActivateOptions: _.partial(setIsActive, true),
    setDeactivateOptions: _.partial(setIsActive, false)
};
