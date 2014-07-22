var userSvc = require('../../services/authentication/userService');
var errSvc = require('../../services/error/errorService');
var _ = require('lodash');

function saveUser(options) {


    var addOnly = (options && options.addOnly) || false;

    return function (req, res, next) {

        if (!req.body.user) res.send(409, 'Server expects "user"');

        userSvc.save(req.body.user, {addOnly: addOnly})
            .then(function (user) {
                res.send(200, user.viewModel());
                return next();
            })
            .fail(function (err) {
                res.send(errSvc.checkErrorCode(err, "E1000") ? 409 : 500, err);
                return next();
            });

    }
}

function getUser(req, res, next) {

    if (!req.params.userName) res.send(409, "Server expects user name to retrieve user");

    userSvc.getSingle(req.params.userName)
        .then(function (user) {
            res.json(user.viewModel());
            return next();

        })
        .fail(function (err) {
            res.send(errSvc.checkErrorCode(err, "E1001") ? 404 : 500, err);
            return next();

        });


}

function getUsers(req, res, next) {

    userSvc.getList({})
        .then(function (users) {
            res.json(_.map(users, function (user) {
                return user.viewModel()
            }));
            return next();

        })
        .fail(function (err) {
            res.send(errSvc.checkErrorCode(err, "E1001") ? 404 : 500, err);
            return next();

        });

}

function addRole(req, res, next) {

    if (!req.params.userName) res.send(409, 'Server expects "userName" in query');
    if (!req.body.role) res.send(409, 'Server expects "role"');

    userSvc.addRole(req.params.userName, req.body.role)
        .then(function (user) {
            res.json(user.roles);
            return next();

        })
        .fail(function (err) {
            res.send(errSvc.checkErrorCode(err, "E1002") ? 409 : 500, err);
            return next();

        });
}

function removeRole(req, res, next) {

    if (!req.params.userName) res.send(409, 'Server expects "userName" in query');
    if (!req.body.role) res.send(409, 'Server expects "role"');

    userSvc.removeRole(req.params.userName, req.body.role)
        .then(function (user) {
            res.json(user.roles);
            return next();

        })
        .fail(function (err) {
            res.send(errSvc.checkErrorCode(err, "E1002") ? 409 : 500, err);
            return next();

        });
}

function getRoles(req, res, next) {

    if (!req.params.userName) res.send(409, "Server expects user name to retrieve user");

    userSvc.getSingle(req.params.userName)
        .then(function (user) {
            res.send({ roles: user.roles });
            return next();

        })
        .fail(function (err) {
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
    getRoles: getRoles
};