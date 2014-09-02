"use strict";
require('require-enhanced')();

var userSvc = global.rootRequire('svc-user');

function saveUser(options) {

    var addOnly = (options && options.addOnly) || false;
    return function (req, res, next) {

        if (!req.body || Object.getOwnPropertyNames(req.body).length === 0) {
            res.status(400);
            res.end('No request body');
        } else {
            userSvc.save({addOnly: addOnly}, req.body)
                .then(function (user) {
                    res.send((addOnly ? 201 : 200), user.viewModel('user', req.path()));
                })
                .fail(function (err) {
                    res.status(global.errSvc.checkErrorCode(err, "E1000") ? 405 : 500);
                    res.end(err.message);
                })
                .fin(next)
                .done();
        }
    };

}


function getUser(req, res, next) {

    if (!req.params.userName) {
        res.status(400);
        res.end("Server expects user name to retrieve user");
    } else {
        userSvc.getSingle(req.params.userName)
            .then(function (user) {
                res.send(200, user.viewModel('user', req.path()));
            })
            .fail(function (err) {
                res.status(global.errSvc.checkErrorCode(err, "E1001") ? 404 : 500);
                res.end(err.message);
            })
            .fin(next)
            .done();

    }


}

function getUsers(req, res, next) {

    userSvc.getList({})
        .then(function (users) {
            res.send(200, global._.map(users, function (user) {
                return user.viewModel('users', req.path());
            }));
            return next();
        })
        .fail(function (err) {
            res.status(global.errSvc.checkErrorCode(err, "E1001") ? 404 : 500);
            res.end(err.message);
            return next();

        })
        .fin(function() {
        })
        .done();

}

function addRole(req, res, next) {

    if (!req.params.userName) { res.status(400); res.end('Server expects "userName" in query'); }
    if (!req.body.role) { res.status(400); res.end('Server expects "role"'); }

    if (req.params.userName && req.body.role) {
        userSvc.addRole(req.params.userName, req.body.role)
            .then(function (user) {
                res.send(201, { roles: user.roles });
            })
            .fail(function (err) {
                res.status(global.errSvc.checkErrorCode(err, "E1002") ? 400 : 500);
                res.end(err.message);
            })
            .fin(next)
            .done();
    }
}

function removeRole(req, res, next) {

    if (!req.params.userName) { res.status(400); res.end('Server expects "userName" in query'); }
    if (!req.body.role) { res.status(400); res.end('Server expects "role"'); }

    if (req.params.userName && req.body.role) {
        userSvc.removeRole(req.params.userName, req.body.role)
            .then(function (user) {
                res.send(200, { roles: user.roles });
            })
            .fail(function (err) {
                res.status(global.errSvc.checkErrorCode(err, "E1002") ? 400 : 500);
                res.end(err.message);
            })
            .fin(next)
            .done();
    }

}

function getRoles(req, res, next) {

    if (!req.params.userName) { res.status(400); res.end("Server expects user name to retrieve user"); }

    if (req.params.userName) {
        userSvc.getSingle(req.params.userName)
            .then(function (user) {
                res.send(200, { roles: user.roles });
            })
            .fail(function (err) {
                res.status(global.errSvc.checkErrorCode(err, "E1001") ? 404 : 500);
                res.end(err.message);
            })
            .fin(next)
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
    addRole: addRole,
    removeRole: removeRole,
    getRoles: getRoles,
    _setUserService: _setUserService
};