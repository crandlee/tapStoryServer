"use strict";

var cb = require('common-bundle')();
var authSvc = cb.rootRequire('svc-passport');


function authenticateMethod() {
    return authSvc.authenticateMethod();
}

function authorizeMethod(opts) {

    opts = opts || {};

    return function (req, res, next) {

        var afterAuthenticate = function() {
            var user = req.user;
            if (!user) {
                res.status(401);
                res.end();
            } else {
                var requestedUser = (req.params && req.params.userName);
                var authByRole = !opts.role || (user.hasRole(opts.role));
                var authByUser = !opts.currentUser || (user.userName.toLowerCase() === requestedUser.toLowerCase());
                var authorized = ((opts.op || 'and') === 'or')
                    ? (authByRole || authByUser)
                    : (authByRole && authByUser);

                if (opts.isAdult) authorized = (!user.isMinor);

                if (authorized) {
                    return next();
                } else {
                    res.status(403);
                    res.end('Current user is not authorized to view or operate on this resource');
                }

            }

        };

        var auth = authSvc.authenticateMethod(req, res, next);
        auth(req, res, afterAuthenticate);


    };
}

//Also exports some common role configurations for use in setup
//on the routers
module.exports = {
    authenticateMethod: authenticateMethod,
    authorizeMethod: authorizeMethod,
    adminRoles: { role: ['admin', 'super-admin'], isAdult: true },
    superAdmin: { role: ['super-admin'], isAdult: true },
    adminRolesOrCurrent: { currentUser: true, role: ['admin', 'super-admin'], op: 'or', isAdult: true },
    currentUserAndAdult: { currentUser: true, isAdult: true },
    currentUser: { currentUser: true }
};