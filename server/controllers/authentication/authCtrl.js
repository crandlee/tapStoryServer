"use strict";

var cb = require('common-bundle')();
var authSvc = cb.rootRequire('svc-passport');
var userRelSvc = cb.rootRequire('svc-rel');
var ctrlHelper = cb.rootRequire('ctrl-helper');
var _ = cb._;
var enums = cb.rootRequire('enums');

function authenticateMethod() {
    return authSvc.authenticateMethod();
}

function authorizeMethod(opts) {

    opts = opts || {};
    return function (req, res, next) {

        var finalAuthorize = function (authorized) {
            if (!authorized)
                ctrlHelper.setForbidden(res, 'Current user is not authorized to view or operate on this resource');
        };

        var isValidGuardianRelationship = function (rel) {

            if (rel && rel.participants && rel.participants.length === 2) {
                return _.every(rel.participants, function (p) {
                    return (p.status && p.status === enums.statuses.active) &&
                        (p.rel && _.indexOf([enums.relationships.guardian, enums.relationships.child], p.rel) > -1);
                });
            }

        };

        var afterAuthenticate = function () {
            var user = req.user;
            if (!user) {
                ctrlHelper.setUnauthorized(res);
            } else {
                var requestedUser = (req.params && req.params.userName);
                var authByRole = !opts.role || (user.hasRole(opts.role));
                var authByUser = !opts.currentUser || (user.userName.toLowerCase() === requestedUser.toLowerCase())
                    && (opts.allowInactive || opts.currentUser.isActive);
                var authByAdult = !opts.isAdult || (!user.isMinor);

                var authorized = authByRole || ((opts.op || 'and') === 'or')
                    ? (authByAdult || authByUser)
                    : (authByAdult && authByUser);

                if (opts.isGuardian) {
                    var targetChild = (req && req.params && req.params.relUser || '');
                    var getRelOpts = (opts.allowInactive ? { allowInactive: true } : {});
                    userRelSvc.getRelationship([user.userName, targetChild], getRelOpts)
                        .then(function (rel) {
                            authorized = isValidGuardianRelationship(rel);
                            finalAuthorize(authorized);
                        })
                        .fin(next);
                } else {
                    finalAuthorize(authorized);
                    next();
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
    adminRolesOrCurrent: { currentUser: true, role: ['admin', 'super-admin'], isAdult: true },
    currentUserAndAdult: { currentUser: true, isAdult: true },
    currentUserAndGuardian: { currentUser: true, isAdult: true, isGuardian: true },
    currentUser: { currentUser: true }
};