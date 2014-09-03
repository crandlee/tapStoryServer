"use strict";
require('require-enhanced')();

var authorizeSvc = global.rootRequire('svc-auth');
var encryptionSvc = global.rootRequire('util-encryption');
var resSvc = global.rootRequire('svc-resource');

function saveUserOptions(opts) {

    opts.preValidation = function(opts, document) {
        if (!(!!document)) {
            if (!opts.userName) global.errSvc.error('User Name must be valid');
            if (!opts.password) global.errSvc.error('Password must be valid');
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
    opts.preValidation = global.Promise.fbind(function(opts) {
        if (!opts.userName) global.errSvc.error('User Name must be valid');
        if (!opts.groupId) global.errSvc.error('User file group id must be valid');
        if (!opts.groupName && !opts.existing && addOrRemove !== 'remove')
            global.errSvc.error('User file group name must be valid');
        if (!opts.file) global.errSvc.error('Upload files for user must be valid');
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

    opts.preValidation = global.Promise.fbind(function(opts) {
        if (!opts.userName) global.errSvc.error('User Name must be valid', {});
        if (!opts.groupId) global.errSvc.error('User file group id must be valid', {});
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
    opts.preValidation = global.Promise.fbind(function(opts) {
        if (!opts.role) global.errSvc.error('New role must be valid');
        if (!opts.userName) global.errSvc.error('User name must be valid');
        return opts;
    });
    opts.modelName = 'User';
    opts.find = { userName: opts.userName };
    opts.manualSave = function(opts) {
        if (opts.role) {
            if (!authorizeSvc.isValidRole(opts.role))
                global.errSvc.error('Not a valid role', { role: opts.role });
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
        if (!opts.role) global.errSvc.error('Role must be valid');
        if (!opts.userName) global.errSvc.error('User name must be valid');
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
    setAddFileOptions: global._.partial(setFileOptions, 'add'),
    setRemoveFileOptions: global._.partial(setFileOptions, 'remove'),
    setAddRoleOptions: setAddRoleOptions,
    setRemoveRoleOptions: setRemoveRoleOptions,
    setRemoveFileGroupOptions: setRemoveFileGroupOptions,
    setSaveUserOptions: saveUserOptions
};
