"use strict";
var cb = require('common-bundle')();
var _ = cb._;
var errSvc = cb.errSvc;

var userSvc = cb.rootRequire('svc-user');
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

    userSvc.deactivate(req.params.userName, {})
        .then(_.partial(ctrlHelper.setOk, res, next))
        .fail(_.partial(ctrlHelper.setInternalError, res, next))
        .done();

}

function activateUser(req, res, next) {

    userSvc.activate(req.params.userName, {})
        .then(_.partial(ctrlHelper.setOk, res, next))
        .fail(_.partial(ctrlHelper.setInternalError, res, next))
        .done();

}


function getUser(req, res, next) {

    userSvc.getSingle(req.params.userName)
        .then(function (user) {
            if (!user)
                ctrlHelper.setBadRequest(res, next, 'No user found for this criteria');
            else
                ctrlHelper.setOk(res, next, user.viewModel('user'));
        })
        .fail(_.partial(ctrlHelper.setInternalError, res, next))
        .done();

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

    userSvc.addRole(req.params.userName, req.body.role)
        .then(function (user) {
            ctrlHelper.setCreated(res, next, { roles: user.roles });
        })
        .fail(function (err) {
            (errSvc.checkErrorCode(err, "E1002") ? ctrlHelper.setBadRequest : ctrlHelper.setInternalError)
                (res, next, err.message);
        })
        .done();

}

function removeRole(req, res, next) {

    userSvc.removeRole(req.params.userName, req.body.role)
        .then(function (user) {
            ctrlHelper.setOk(res, next, { roles: user.roles });
        })
        .fail(function (err) {
            (errSvc.checkErrorCode(err, "E1002") ? ctrlHelper.setBadRequest : ctrlHelper.setInternalError)
                (res, next, err.message);
        })
        .done();

}

function getRoles(req, res, next) {

    return userSvc.getSingle(req.params.userName)
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