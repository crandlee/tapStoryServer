"use strict";
require('require-enhanced')();

var authorizeSvc = global.rootRequire('svc-auth');
var encryptionSvc = global.rootRequire('util-encryption');
var resSvc = global.rootRequire('svc-resource');

function saveUserOptions(opts) {

    opts.preValidation = global.Promise.fbind(function(opts) {
        if (!opts.userName)
            global.errSvc.error('User Name must be valid');
        return opts;
    });
    opts.onNew = {
        roles: 'user'
    };
    opts.modelName = 'User';
    opts.singleSearch = { userName: opts.userName };
    opts.mapPropertiesToResource = global.Promise.fbind(function(resource, opts) {

        if (opts.firstName) resource.firstName = opts.firstName;
        if (opts.lastName) resource.lastName = opts.lastName;
        if (opts.userName) resource.userName = opts.userName;
        if (opts.password && opts.password.length > 0) {
            return encryptionSvc.saltAndHash(opts.password).then(function (token) {
                resource.userSecret = token;
                return resource;
            });
        }
        return resource;

    });
    return opts;
}

function setFileOptions(addOrRemove, opts) {

    opts.updateOnly = true;
    opts.preValidation = global.Promise.fbind(function(opts) {
        if (!opts.userName) global.errSvc.error('User Name must be valid', {});
        if (!opts.groupId) global.errSvc.error('User file group id must be valid', {});
        if (!opts.groupName && !opts.existing && addOrRemove !== 'remove')
            global.errSvc.error('User file group name must be valid', {});
        if (!opts.file) global.errSvc.error('Upload file for user must be valid', {});
        return opts;
    });
    opts.modelName = 'User';
    opts.singleSearch = { userName: opts.userName };
    opts.mapPropertiesToResource = global.Promise.fbind(function(resource, opts) {
        return resource;
    });

    opts.manualSave = function(resource, opts) {

        if (addOrRemove === 'remove') {
            return resSvc.modelUpdate(opts.model,
                  { "userName": opts.userName, "fileGroups.groupId" : opts.groupId }
                , { $pull: { "fileGroups.$.files": { fileName: opts.file } } });
        } else {
            resource.addFiles(opts.file, opts.groupId, opts.groupName);
            return resSvc.saveResource(resource);
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
    opts.singleSearch = { userName: opts.userName };
    opts.mapPropertiesToResource = global.Promise.fbind(function(resource) {
        return resource;
    });
    opts.manualSave = function(resource, opts) {

        return resSvc.modelUpdate(opts.model, { "userName" : opts.userName }
            , { $pull : { "fileGroups" : { "groupId": opts.groupId } } });

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
    opts.singleSearch = { userName: opts.userName };
    opts.mapPropertiesToResource = global.Promise.fbind(function(resource, opts) {
        if (opts.role && global._.indexOf(resource.roles, opts.role) === -1) {
            if (!authorizeSvc.isValidRole(opts.role))
                global.errSvc.error('Not a valid role', { role: opts.role });
        }
        return resource;
    });
    return opts;
}

function setRemoveRoleOptions(opts) {

    opts.updateOnly = true;
    opts.role = (opts.role && opts.role.toLowerCase());
    opts.preValidation = global.Promise.fbind(function(opts) {
        if (!opts.role) global.errSvc.error('Role must be valid');
        if (!opts.userName) global.errSvc.error('User name must be valid');
        return opts;
    });
    opts.modelName = 'User';
    opts.singleSearch = { userName: opts.userName };
    opts.mapPropertiesToResource = global.Promise.fbind(function(resource, opts) {

        if (opts.role && global._.indexOf(resource.roles, opts.role) > -1)
            resource.roles.splice(global._.indexOf(resource.roles, opts.role), 1);
        return resource;
    });
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
