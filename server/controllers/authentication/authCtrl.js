"use strict";

var cb = require('common-bundle')();
var authSvc = cb.rootRequire('svc-passport');


function authenticateMethod() {
    return authSvc.authenticateMethod();
}

function authorizeMethod(opts) {

    opts = opts || {};

    return function(req, res, next) {

        var user = req.user;
        if (!req.user) return authSvc.authenticateMethod(req, res, next);

        var requestedUser = (req.params && req.params.userName);
        var authByRole = !opts.role || (user.hasRole(opts.role));
        var authByUser = !opts.currentUser || (user.userName.toLowerCase() === requestedUser.toLowerCase());
        var authorized = ((opts.op || 'and') === 'or')
            ? (authByRole || authByUser)
            : (authByRole && authByUser);

        if (authorized) {
            return next();
        } else {
            res.status(403);
            res.end('Current user is not authorized to view or operate on this resource');
        }
    };
}

//Also exports some common role configurations for use in setup
//on the routers
module.exports = {
    authenticateMethod: authenticateMethod,
    authorizeMethod: authorizeMethod,
    adminRoles: { role: ['admin', 'super-admin']},
    superAdmin: { role: ['super-admin']},
    adminRolesOrCurrent: { currentUser: true, role: ['admin', 'super-admin'], op: 'or' },
    currentUser: { currentUser: true }
};