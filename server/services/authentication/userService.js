"use strict";
require('require-enhanced')();

var errSvc = global.rootRequire('svc-error')(null, "userService");
var resourceSvc = global.rootRequire('svc-resource');
var encryptionSvc = global.rootRequire('util-encryption');
var _ = require('lodash');
var authorizeSvc = global.rootRequire('svc-auth');
var promiseSvc = global.rootRequire('svc-promise');

function _setErrorService(errorService){
    errSvc = errorService;
}

function save(updateProperties, options) {


    options.userName = (updateProperties && updateProperties.userName) || '';

    options.preValidation = function(updateProperties, options, pid) {

        if (!options.userName) errSvc.errorFromPromise(pid, {}, 'userName must be valid');

    };
    options.onNew = {
      roles: 'user'
    };
    options.modelName = 'User';
    options.singleSearch = { userName: options.userName };
    options.mapPropertiesToResource = mapPropertiesToResource;

    return resourceSvc.save(updateProperties, options);

}

function addRole(userName, newRole) {


    var options = getOptionsObject('addRole', userName, newRole);
    return resourceSvc.save({ role: options.role }, options);

}

function getOptionsObject(fName) {

    var options = {}, args = arguments;

    switch (fName) {
        case 'addRole':
            (function() {
                var userName = args[1], newRole = args[2];
                options.updateOnly = true;
                options.userName = userName || '';
                options.role = (newRole && newRole.toLowerCase()) || '';
                options.preValidation = function(updateProperties, options, pid) {
                    if (!options.role) errSvc.errorFromPromise(pid, {}, 'new role must be valid');
                    if (!options.userName) errSvc.errorFromPromise(pid, {}, 'user name must be valid');
                };
                options.modelName = 'User';
                options.singleSearch = { userName: options.userName };

                options.mapPropertiesToResource = function(resource, updateProperties) {
                    var pid = promiseSvc.createPromise();
                    if (updateProperties.role && _.indexOf(resource.roles, updateProperties.role) === -1) {
                        if (!authorizeSvc.isValidRole(updateProperties.role))
                            errSvc.errorFromPromise(pid, {}, 'Not a valid role');
                        else {
                            resource.roles.push(updateProperties.role);
                            promiseSvc.resolve(resource, pid);
                        }
                    } else {
                        promiseSvc.resolve(resource, pid);
                    }

                    return promiseSvc.getPromise(pid);
                };

            }());

            break;
        case 'removeRole':
            (function() {

                var userName = args[1], existRole = args[2];
                options.updateOnly = true;
                options.userName = userName || '';
                options.role = (existRole && existRole.toLowerCase()) || '';
                options.preValidation = function(updateProperties, options, pid) {
                    if (!options.role) errSvc.errorFromPromise(pid, {}, 'role must be valid');
                    if (!options.userName) errSvc.errorFromPromise(pid, {}, 'user name must be valid');
                };
                options.modelName = 'User';
                options.singleSearch = { userName: options.userName };

                options.mapPropertiesToResource = function(resource, updateProperties) {
                    var pid = promiseSvc.createPromise();

                    if (updateProperties.role && _.indexOf(resource.roles, updateProperties.role) > -1)
                        resource.roles.splice(_.indexOf(resource.roles, updateProperties.role), 1);
                    promiseSvc.resolve(resource, pid);
                    return promiseSvc.getPromise(pid);
                };

            }());

            break;
        default:

    }
    return options;
}

function removeRole(userName, existRole) {

    var options = getOptionsObject('removeRole', userName, existRole);
    return resourceSvc.save({ role: options.role }, options);

}


function mapPropertiesToResource (resource, updateProperties) {

    var pid = promiseSvc.createPromise();
    if (updateProperties.firstName)
        resource.firstName = updateProperties.firstName;
    if (updateProperties.lastName)
        resource.lastName = updateProperties.lastName;
    if (updateProperties.userName)
        resource.userName = updateProperties.userName;
    if (updateProperties.password && updateProperties.password.length > 0) {
        encryptionSvc.saltAndHash(updateProperties.password).then(function (token) {
            resource.userSecret = token;
            promiseSvc.resolve(resource, pid);
        });
    } else {
        promiseSvc.resolve(resource, pid);
    }
    return promiseSvc.getPromise(pid);


}

function getList(query) {

    var options = {};
    options.modelName = 'User';
    options.query = query;
    return resourceSvc.getList(options);

}

function getSingle(userName) {
    var options = {};
    options.modelName = 'User';
    options.query = {userName: userName};
    return resourceSvc.getSingle(options);
}


module.exports = {
    save: save,
    getSingle: getSingle,
    getList: getList,
    addRole: addRole,
    removeRole: removeRole,
    getOptionsObject: getOptionsObject,
    _setErrorService: _setErrorService
};