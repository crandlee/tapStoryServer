"use strict";
require('require-enhanced')();

var userSvc = global.rootRequire('svc-user');
var errSvc = global.rootRequire('svc-error')(null, "userController");
var _ = require('lodash');
var linkSvc = global.rootRequire('svc-link');
var promiseSvc = global.rootRequire('svc-promise');

function setErrorService(errorService) {

    errSvc = errorService;

}

function saveUser(options) {


    var addOnly = (options && options.addOnly) || false;

    return function (req, res, next) {

        if (!req.body || Object.getOwnPropertyNames(req.body).length === 0) {
            res.send(400, 'No request body');
        } else {
            userSvc.save({addOnly: addOnly}, req.body)
                .done(function (user) {
                    res.send((addOnly ? 201 : 200), user.viewModel('user'));
                    return next();
                }, function (err) {
                    res.send(errSvc.checkErrorCode(err, "E1000") ? 405 : 500, err);
                    return next();
                });
        }
    };

}


function getUser(req, res, next) {

    if (!req.params.userName) {
        res.send(400, "Server expects user name to retrieve user");
    } else {
        userSvc.getSingle(req.params.userName)
            .done(function (user) {
                res.send(200, user.viewModel('user'));
                return next();

            }, function (err) {
                res.send(errSvc.checkErrorCode(err, "E1001") ? 404 : 500, err);
                return next();

            });

    }


}

function getUsers(req, res, next) {

    userSvc.getList({})
        .done(function (users) {
            res.send(200, _.map(users, function (user) {
                return user.viewModel('users');
            }));
            return next();

        }, function (err) {
            res.send(errSvc.checkErrorCode(err, "E1001") ? 404 : 500, err);
            return next();

        });

}

function addRole(req, res, next) {

    if (!req.params.userName) res.send(400, 'Server expects "userName" in query');
    if (!req.body.role) res.send(400, 'Server expects "role"');

    if (req.params.userName && req.body.role) {
        userSvc.addRole(req.params.userName, req.body.role)
            .done(function (user) {
                res.send(201, linkSvc.attachLinksToObject({ roles: user.roles }, [
                    { uri: '/../' + user.userName, rel: 'user', isRelative: true}
                ]));
                return next();

            }, function (err) {
                res.send(errSvc.checkErrorCode(err, "E1002") ? 400 : 500, err);
                return next();

            });
    }
}

function removeRole(req, res, next) {

    if (!req.params.userName) res.send(400, 'Server expects "userName" in query');
    if (!req.body.role) res.send(400, 'Server expects "role"');

    if (req.params.userName && req.body.role) {

        userSvc.removeRole(req.params.userName, req.body.role)
            .done(function (user) {
                res.send(200, linkSvc.attachLinksToObject({ roles: user.roles }, [
                    { uri: '/../' + user.userName, rel: 'user', isRelative: true}
                ]));
                return next();

            }, function (err) {
                res.send(errSvc.checkErrorCode(err, "E1002") ? 400 : 500, err);
                return next();

            });
    }
}

function getRoles(req, res, next) {

    if (!req.params.userName) res.send(400, "Server expects user name to retrieve user");

    userSvc.getSingle(req.params.userName)
        .done(function (user) {
            res.send(200, linkSvc.attachLinksToObject({ roles: user.roles }, [
                { uri: '/../' + user.userName, rel: 'user', isRelative: true}
            ]));
            return next();

        }, function (err) {
            res.send(errSvc.checkErrorCode(err, "E1001") ? 404 : 500, err);
            return next();
        });


}


module.exports = {
    saveUser: saveUser,
    getUser: getUser,
    getUsers: getUsers,
    addRole: addRole,
    removeRole: removeRole,
    getRoles: getRoles,
    _setErrorService: setErrorService
};