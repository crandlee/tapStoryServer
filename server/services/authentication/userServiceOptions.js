"use strict";
var cb = require('common-bundle')();
var _ = cb._;
var errSvc = cb.errSvc;
var promise = cb.Promise;

var authorizeSvc = cb.rootRequire('svc-auth');
var encryptionSvc = cb.rootRequire('util-encryption');
var resSvc = cb.rootRequire('svc-resource');

function saveUserOptions(opts) {

    opts.preValidation = function(opts, document) {
        if (!(!!document)) {
            if (!opts.userName) errSvc.error('Adding a user requires userName');
            if (!opts.password) errSvc.error('Adding a user requires a password');
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
        doc.userName = opts.userName;
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

module.exports = {
    setAddFileOptions: _.partial(setFileOptions, 'add'),
    setRemoveFileOptions: _.partial(setFileOptions, 'remove'),
    setAddRoleOptions: setAddRoleOptions,
    setRemoveRoleOptions: setRemoveRoleOptions,
    setRemoveFileGroupOptions: setRemoveFileGroupOptions,
    setSaveUserOptions: saveUserOptions
};
