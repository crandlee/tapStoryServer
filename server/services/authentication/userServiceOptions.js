"use strict";
require('require-enhanced')();

var _ = require('lodash');
var authorizeSvc = global.rootRequire('svc-auth');
var errSvc = global.rootRequire('svc-error')(null, "userService");
var promiseSvc = global.rootRequire('svc-promise');
var encryptionSvc = global.rootRequire('util-encryption');

function _setErrorService(errorService){
    errSvc = errorService;
}

function saveUserOptions(options, args) {

    options.preValidation = function(options, pid) {

        if (!options.userName) errSvc.errorFromPromise(pid, {}, 'userName must be valid');

    };
    options.onNew = {
        roles: 'user'
    };
    options.modelName = 'User';
    options.singleSearch = { userName: options.userName };

    options.mapPropertiesToResource = function(resource) {

        var pid = promiseSvc.createPromise();
        if (options.firstName)
            resource.firstName = options.firstName;
        if (options.lastName)
            resource.lastName = options.lastName;
        if (options.userName)
            resource.userName = options.userName;
        if (options.password && options.password.length > 0) {
            encryptionSvc.saltAndHash(options.password).then(function (token) {
                resource.userSecret = token;
                promiseSvc.resolve(resource, pid);
            });
        } else {
            promiseSvc.resolve(resource, pid);
        }
        return promiseSvc.getPromise(pid);

    };

}

function setFileOptions(addOrRemove, options) {

    options.updateOnly = true;
    options.preValidation = function(options, pid) {
        if (!options.userName) errSvc.errorFromPromise(pid, {}, 'user name must be valid');
        if (!options.groupId) errSvc.errorFromPromise(pid, {}, 'user file group id must be valid');
        if (!options.file) errSvc.errorFromPromise(pid, {}, 'upload file for user must be valid');
    };
    options.modelName = 'User';
    options.singleSearch = { userName: options.userName };

    options.mapPropertiesToResource = function(resource) {
        var pid = promiseSvc.createPromise();
        try {
            if (addOrRemove && addOrRemove === 'remove') {
                resource.removeFile(options.groupId, options.file);
            } else {
                resource.addFile(options.file, options.groupId);
            }
            promiseSvc.resolve(pid, null);
        } catch(e) {
            errSvc.errorFromPromise(pid, { userName: resource.userName, error: e }, 'Could not associate the uploaded file with this user');
        }

        return promiseSvc.getPromise(pid);
    };


}

function setAddRoleOptions(options) {

    options.updateOnly = true;
    options.role = options.role.toLowerCase();
    options.preValidation = function(options, pid) {
        if (!options.role) errSvc.errorFromPromise(pid, {}, 'new role must be valid');
        if (!options.userName) errSvc.errorFromPromise(pid, {}, 'user name must be valid');
    };
    options.modelName = 'User';
    options.singleSearch = { userName: options.userName };

    options.mapPropertiesToResource = function(resource) {
        var pid = promiseSvc.createPromise();
        if (options.role && _.indexOf(resource.roles, options.role) === -1) {
            if (!authorizeSvc.isValidRole(options.role))
                errSvc.errorFromPromise(pid, {}, 'Not a valid role');
            else {
                resource.roles.push(options.role);
                promiseSvc.resolve(resource, pid);
            }
        } else {
            promiseSvc.resolve(resource, pid);
        }

        return promiseSvc.getPromise(pid);
    };

}

function setRemoveRoleOptions(options) {

    options.updateOnly = true;
    options.role = options.role.toLowerCase();
    options.preValidation = function(options, pid) {
        if (!options.role) errSvc.errorFromPromise(pid, {}, 'role must be valid');
        if (!options.userName) errSvc.errorFromPromise(pid, {}, 'user name must be valid');
    };
    options.modelName = 'User';
    options.singleSearch = { userName: options.userName };

    options.mapPropertiesToResource = function(resource) {
        var pid = promiseSvc.createPromise();

        if (options.role && _.indexOf(resource.roles, options.role) > -1)
            resource.roles.splice(_.indexOf(resource.roles, options.role), 1);
        promiseSvc.resolve(resource, pid);
        return promiseSvc.getPromise(pid);
    };

}

module.exports = {
    setAddFileOptions: _.partial(setFileOptions, 'add'),
    setRemoveFileOptions: _.partial(setFileOptions, 'remove'),
    setAddRoleOptions: setAddRoleOptions,
    setRemoveRoleOptions: setRemoveRoleOptions,
    setSaveUserOptions: saveUserOptions,
    _setErrorService : _setErrorService
};
