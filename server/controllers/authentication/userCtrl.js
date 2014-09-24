"use strict";
var cb = require('common-bundle')();
var _ = cb._;
var errSvc = cb.errSvc;

var userSvc = cb.rootRequire('svc-user');
var userRelSvc = cb.rootRequire('svc-rel');
var ctrlHelper = cb.rootRequire('ctrl-helper');

function saveUser(options) {

    var addOnly = (options && options.addOnly) || false;
    return function (req, res, next) {

        if (!req.body || Object.getOwnPropertyNames(req.body).length === 0) {
            ctrlHelper.setBadRequest(res, next, 'No request body');
        } else {
            //query param overrides userName in body
            if (req.params.userName) req.body.userName = req.params.userName;
            userSvc.save({addOnly: addOnly}, req.body)
                .then(function (user) {
                    if (!user) {
                        ctrlHelper.setNotFound(res, next, 'No user returned from the operation');
                    } else {
                        (addOnly ? ctrlHelper.setCreated: ctrlHelper.setOk)
                            (res, next, user.viewModel('user'))
                    }
                })
                .fail(_.partial(ctrlHelper.setInternalError, res, next))
                .done();
        }
    };

}

function deactivateUser(req, res, next) {

    var userName = (req.params && req.params.userName);
    if (!userName)
        ctrlHelper.setBadRequest(res, next, 'Deactivating a user requires a source userName');

    userSvc.deactivate(userName, {})
        .then(_.partial(ctrlHelper.setOk, res, next))
        .fail(_.partial(ctrlHelper.setInternalError, res, next))
        .done();

}

function activateUser(req, res, next) {

    var userName = (req.params && req.params.userName);
    if (!userName)
        ctrlHelper.setBadRequest(res, next, 'Activating a user requires a source userName');

    userSvc.activate(userName, {})
        .then(_.partial(ctrlHelper.setOk, res, next))
        .fail(_.partial(ctrlHelper.setInternalError, res, next))
        .done();

}


function getUser(req, res, next) {

    //May be a relUser being requested, check it first (also allow relUser2 for checking child friend)
    // (from a relationship route for instance)
    var relUser = (req.params && req.params.relUser);
    if  (req.params && req.params.relUser2) relUser = req.params.relUser2;

    var userName = (req.params && (req.params.userName));
    var shouldHideLinks = !!relUser;

    var getUserWithRelatedUserBehavior = function(sourceUser, relUser, shouldHideLinks, res, next) {

        if (relUser) {
            return userRelSvc.canViewRelationshipUser(sourceUser, relUser, shouldHideLinks)
                .then(function(canView) {
                    if (canView) {
                        return retrieveUserAndHandleResult(relUser, shouldHideLinks, res, next);
                    } else {
                        ctrlHelper.setForbidden(res, next, 'Cannot view a user with which you have no active relationship');
                    }
                })
        } else {
            return retrieveUserAndHandleResult(sourceUser, shouldHideLinks, res, next);
        }

    };

    var retrieveUserAndHandleResult = function(userName, shouldHideLinks, res, next) {

        //If this came in as a target user, verify against the target user through
        if (!userName) {
            ctrlHelper.setBadRequest(res, next, 'Getting a user requires a userName');
        } else {
            userSvc.getSingle(userName)
                .then(function (user) {
                    if (!user)
                        ctrlHelper.setBadRequest(res, next, 'No user found for this criteria');
                    else
                        ctrlHelper.setOk(res, next, user.viewModel('user'));
                })
                .fail(_.partial(ctrlHelper.setInternalError, res, next))
                .done();
        }

    };

    getUserWithRelatedUserBehavior(userName, relUser, shouldHideLinks, res, next);

}

function getUsers(req, res, next) {

    userSvc.getList({})
        .then(function (users) {
            if (!users || users.length === 0) {
                ctrlHelper.setNotFound(res, next, 'No users found');
            } else {
                ctrlHelper.setOk(res, next, users.map(function (user) {
                    return user.viewModel('user');
                }));
            }
        })
        .fail(_.partial(ctrlHelper.setInternalError, res, next))
        .done();

}

function addRole(req, res, next) {

    var userName = (req.params && req.params.userName);
    var role = (req.body && req.body.role);

    if (!userName) ctrlHelper.setBadRequest(res, next, 'Adding a role requires a userName');
    if (!role) ctrlHelper.setBadRequest(res, next, 'Adding a role requires a role');

    if (userName && role) {
        userSvc.addRole(userName, role)
            .then(function (user) {
                ctrlHelper.setCreated(res, next, { roles: user.roles });
            })
            .fail(function (err) {
                (errSvc.checkErrorCode(err, "E1002") ? ctrlHelper.setBadRequest : ctrlHelper.setInternalError)
                    (res, next, err.message);
            })
            .done();
    }
}

function removeRole(req, res, next) {

    var userName = (req.params && req.params.userName);
    var role = (req.body && req.body.role);

    if (!userName) ctrlHelper.setBadRequest(res, next, 'Removing a role requires a userName');
    if (!role) ctrlHelper.setBadRequest(res, next, 'Removing a role requires a role');

    if (userName && role) {
        userSvc.removeRole(userName, role)
            .then(function (user) {
                ctrlHelper.setOk(res, next, { roles: user.roles });
            })
            .fail(function (err) {
                (errSvc.checkErrorCode(err, "E1002") ? ctrlHelper.setBadRequest : ctrlHelper.setInternalError)
                    (res, next, err.message);
            })
            .done();
    }

}

function getRoles(req, res, next) {

    var userName = (req.params && req.params.userName);
    if (!userName) ctrlHelper.setBadRequest(res, next, 'Getting roles requires a userName');

    if (userName) {
        return userSvc.getSingle(userName)
            .then(function (user) {
                if (!user) {
                    ctrlHelper.setNotFound(res, next, 'Cannot find requested user');
                } else {
                    ctrlHelper.setOk(res, next, user.roles);
                }
            })
            .fail(_.partial(ctrlHelper.setInternalError, res, next))
            .done();

    }

}


function _setUserService(service) {
    userSvc = service;
}

module.exports = {
    saveUser: saveUser,
    getUser: getUser,
    getUsers: getUsers,
    activateUser: activateUser,
    deactivateUser: deactivateUser,
    addRole: addRole,
    removeRole: removeRole,
    getRoles: getRoles,
    _setUserService: _setUserService
};