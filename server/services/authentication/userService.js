var Q = require('q');
var errSvc = require('../error/errorService').initialize(null, "userService");
var resourceSvc = require('../utilities/resourceService');
var encryptionSvc = require('../../utilities/encryptionUtility');
var _ = require('lodash');
var authorizeSvc = require('../authorization/authorizationService');

function setErrorHandler(handler) {
    errSvc = handler;
}

function save(updateProperties, options) {


    options.userName = (updateProperties && updateProperties.userName) || '';

    options.preValidation = function(updateProperties, options, deferred) {

        if (!options.userName) errSvc.errorFromPromise(deferred, {}, 'userName must be valid');

    };
    options.onNew = {
      roles: 'user'
    };
    options.model = 'User';
    options.singleSearch = { userName: options.userName };
    options.mapPropertiesToResource = mapPropertiesToResource;

    return resourceSvc.save(updateProperties, options);

}

function addRole(userName, newRole) {

    var options = {};
    options.updateOnly = true;
    options.userName = userName || '';
    options.role = (newRole && newRole.toLowerCase()) || '';
    options.preValidation = function(updateProperties, options, deferred) {
        if (!options.role) errSvc.errorFromPromise(deferred, {}, 'new role must be valid');
        if (!options.userName) errSvc.errorFromPromise(deferred, {}, 'user name must be valid');
    };
    options.model = 'User';
    options.singleSearch = { userName: options.userName };

    options.mapPropertiesToResource = function(resource, updateProperties) {
        var deferred = Q.defer();
        if (updateProperties.role
            && _.indexOf(resource.roles, updateProperties.role) === -1) {
            if (!authorizeSvc.isValidRole(updateProperties.role))
                errSvc.errorFromPromise(deferred, {}, 'Not a valid role');
            else {
                resource.roles.push(updateProperties.role);
                deferred.resolve(resource);
            }
        } else {
            deferred.resolve(resource);
        }

        return deferred.promise;
    };

    return resourceSvc.save({ role: options.role }, options);

}


function removeRole(userName, existRole) {

    var options = {};
    options.updateOnly = true;
    options.userName = userName || '';
    options.role = (existRole && existRole.toLowerCase()) || '';
    options.preValidation = function(updateProperties, options, deferred) {
        if (!options.role) errSvc.errorFromPromise(deferred, {}, 'role must be valid');
        if (!options.userName) errSvc.errorFromPromise(deferred, {}, 'user name must be valid');
    };
    options.model = 'User';
    options.singleSearch = { userName: options.userName };

    options.mapPropertiesToResource = function(resource, updateProperties) {
        var deferred = Q.defer();

        if (updateProperties.role && _.indexOf(resource.roles, updateProperties.role) > -1)
            resource.roles.splice(_.indexOf(resource.roles, updateProperties.role), 1);
        deferred.resolve(resource);
        return deferred.promise;
    };

    return resourceSvc.save({ role: options.role }, options);

}


function mapPropertiesToResource (resource, updateProperties) {

    var deferred = Q.defer();
    if (updateProperties.firstName)
        resource.firstName = updateProperties.firstName;
    if (updateProperties.lastName)
        resource.lastName = updateProperties.lastName;
    if (updateProperties.userName)
        resource.userName = updateProperties.userName;
    if (updateProperties.password && updateProperties.password.length > 0) {
        encryptionSvc.saltAndHash(updateProperties.password).then(function (token) {
            resource.userSecret = token;
            deferred.resolve(resource);
        });
    } else {
        deferred.resolve(resource);
    }
    return deferred.promise;


}

function getList(query) {

    var options = {};
    options.model = 'User';
    options.query = query;
    return resourceSvc.getList(options);

}

function getSingle(userName) {
    var options = {};
    options.model = 'User';
    options.query = {userName: userName};
    return resourceSvc.getSingle(options);
}


module.exports = {
    setErrorHandler: setErrorHandler,
    save: save,
    getSingle: getSingle,
    getList: getList,
    addRole: addRole,
    removeRole: removeRole
};