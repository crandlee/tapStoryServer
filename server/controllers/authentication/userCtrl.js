"use strict";
require('require-enhanced')();

var userSvc = global.rootRequire('svc-user');
var linkSvc = global.rootRequire('svc-link');

function saveUser(options) {

    var addOnly = (options && options.addOnly) || false;
    return function (req, res, next) {

        if (!req.body || Object.getOwnPropertyNames(req.body).length === 0) {
            res.status(400);
            res.end('No request body');
            return next();
        } else {
            userSvc.save({addOnly: addOnly}, req.body)
                .then(function (user) {
                    if (!user) {
                        res.status(404);
                        res.end('No user returned from operation');
                    } else {
                        res.send((addOnly ? 201 : 200), user.viewModel('user', req.path()));
                    }
                })
                .fail(function (err) {
                    res.status(500);
                    res.end(err.message);
                })
                .fin(function() { return next(); })
                .done();
        }
    };

}


function getUser(req, res, next) {

    var userName = (req.params && req.params.userName);
    if (!userName) { res.status(400); res.end('Getting a user requires a userName'); }

    if (userName) {
        userSvc.getSingle(userName)
            .then(function (user) {
                if (!user) {
                    res.status(404);
                    res.end('No user found for this criteria');
                }
                res.send(200, user.viewModel('user', req.path()));
            })
            .fail(function (err) {
                res.status(500);
                res.end(err.message);
            })
            .fin(function() { return next(); })
            .done();

    } else {
        return next();
    }


}

function getUsers(req, res, next) {

    userSvc.getList({})
        .then(function (users) {
            if (!users || users.length === 0) {
                res.status(404);
                res.end('No users found');
            } else {
                users = { users: global._.map(users, function (user) {
                    return user.viewModel('users', req.path());
                }) };
                users = linkSvc.attachLinksToObject(users, [
                    { uri: '', rel: 'user', method: 'POST'},
                    { uri: '', rel: 'user', method: 'PUT'}
                ], req.path());
                res.send(200, users);
            }
        })
        .fail(function (err) {
            res.status(500);
            res.end(err.message);
        })
        .fin(function() { return next(); })
        .done();

}

function addRole(req, res, next) {

    var userName = (req.params && req.params.userName);
    var role = (req.body && req.body.role);

    if (!userName) { res.status(400); res.end('Adding a role requires a userName'); }
    if (!role) { res.status(400); res.end('Adding a role requires a role'); }

    if (userName && role) {
        userSvc.addRole(userName, role)
            .then(function (user) {
                res.send(201, { roles: user.roles });
            })
            .fail(function (err) {
                res.status(global.errSvc.checkErrorCode(err, "E1002") ? 400 : 500);
                res.end(err.message);
            })
            .fin(function() { return next(); })
            .done();
    } else {
        return next();
    }
}

function removeRole(req, res, next) {

    var userName = (req.params && req.params.userName);
    var role = (req.body && req.body.role);

    if (!userName) { res.status(400); res.end('Removing a role requires a userName'); }
    if (!role) { res.status(400); res.end('Removing a role requires a role'); }

    if (userName && role) {
        userSvc.removeRole(userName, role)
            .then(function (user) {
                res.send(200, { roles: user.roles });
            })
            .fail(function (err) {
                res.status(global.errSvc.checkErrorCode(err, "E1002") ? 400 : 500);
                res.end(err.message);
            })
            .fin(function() { return next(); })
            .done();
    } else {
        return next();
    }

}

function getRoles(req, res, next) {

    var userName = (req.params && req.params.userName);
    if (!userName) { res.status(400); res.end("Getting roles requires a userName"); }
    if (userName) {
        userSvc.getSingle(userName)
            .then(function (user) {
                if (!user) {
                    res.status(404);
                    res.end('Cannot find requested user');
                } else {
                    var roles = linkSvc.attachLinksToObject({ roles: user.roles },
                        [{ uri: '', rel: 'role', method: 'POST'}, { uri: '', rel: 'role', method: 'DELETE'}],
                            req.path());
                    res.send(200, roles);
                }
            })
            .fail(function (err) {
                res.status(500);
                res.end(err.message);
            })
            .fin(function() { return next(); })
            .done();

    } else {
        return next();
    }

}


function _setUserService(service) {
    userSvc = service;
}

module.exports = {
    saveUser: saveUser,
    getUser: getUser,
    getUsers: getUsers,
    addRole: addRole,
    removeRole: removeRole,
    getRoles: getRoles,
    _setUserService: _setUserService
};