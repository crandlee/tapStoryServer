"use strict";

var cb = require('common-bundle')();
var authSvc = cb.rootRequire('svc-passport');
var userRelSvc = cb.rootRequire('svc-rel');
var ctrlHelper = cb.rootRequire('ctrl-helper');
var _ = cb._;
var enums = cb.rootRequire('enums');
var userSvc = cb.rootRequire('svc-user');

function authenticateMethod() {
    return authSvc.authenticateMethod();
}

function authorizeMethod(opts) {

    opts = opts || {};
    return function (req, res, next) {

        var authStatuses = Object.freeze({ failed: false, passed: true, requireFailed: 'requireFail' });

        var possibleTests = function(authObj, vals) {
            var isRelated = function(testVal, relTypes) {
                var isValidRelationshipType = function (rel, arrOfTypes) {
                    if (rel && rel.participants && rel.participants.length === 2) {
                        return _.every(rel.participants, function (p) {
                            return (p.status && p.status === enums.statuses.active) &&
                                (p.rel && _.indexOf(arrOfTypes, p.rel) > -1);
                        });
                    }
                };

                var targetChild = (vals.relUser || vals.userName || '');
                var getRelOpts = (authObj.allowInactive ? { allowInactive: true } : {});
                return userRelSvc.getRelationship([vals.currentUser.userName, targetChild], getRelOpts)
                    .then(function (rel) {
                        return relTypes && isValidRelationshipType(rel, relTypes) === testVal;
                    });
            };
            return {
                role: function(testVal) {
                    return vals.currentUser.hasRole(testVal);
                },
                isAdult: function(testVal) {
                    return vals.currentUser.isMinor !== testVal;
                },
                currentUser: function(testVal) {
                    return (vals.currentUser.userName.toLowerCase() === vals.userName.toLowerCase()) === testVal;
                },
                allowInactive: function(testVal) {
                    return testVal ? true : vals.currentUser.isActive;
                },
                isGuardian: function(testVal) {
                    if (vals.currentUser.userName.toLowerCase() !== vals.userName.toLowerCase()) {
                        return userSvc.getSingle(vals.userName)
                            .then(function(user) {
                               if (!user) return authStatuses.requireFailed;
                               var required = user.isMinor;
                               return isRelated(testVal, [enums.relationships.guardian, enums.relationships.child])
                                   .then(function(isGuardian) {
                                       if (required && (isGuardian !== testVal)) return authStatuses.requireFailed;
                                       return (isGuardian === testVal);
                                   });
                            });
                    } else {
                        return false;
                    }
                },
                isFriend: function(testVal) {
                    return isRelated(testVal, [enums.relationships.friend]);
                },
                isRelated: function(testVal) {
                    return isRelated(testVal, null);
                }
            };
        };

        var authorizationPasses = function(authObj, vals) {

            var testInvocationList = [];
            var testLibrary = possibleTests(authObj, vals);
            _(authObj).forOwn(function(obj, key) {
                testInvocationList.push(
                    cb.Promise.fcall(testLibrary[key],(obj.val))
                        .then(function(passed) {
                            if (!passed && obj.required) return cb.Promise(authStatuses.requireFailed);
                            return cb.Promise(passed);
                        })
                );
            });
            return cb.Promise.all(testInvocationList)
                .then(function(allTests) {
                    return (!_(allTests).some(function(status) { return status === authStatuses.requireFailed; })
                        && (_(allTests).some(function(status) { return status === authStatuses.passed })));
                });

        };

        var afterAuthenticate = function () {

            var user = req.user;
            var vals = {};

            if (!user) {
                ctrlHelper.setUnauthorized(res);
                next();
            } else {

                vals = req.params;
                vals.currentUser = req.user;

                authorizationPasses(opts, vals)
                    .then(function(passed) {

                        if (!passed)
                            ctrlHelper.setForbidden(res,
                                'The current user is not authorized to run this operation on this resource');

                    })
                    .fail(_.partial(ctrlHelper.setInternalError, res))
                    .fin(next)
                    .done();

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
    adminRoles: { role: { val: ['admin', 'super-admin'], required: true } , isAdult: { val: true, required: true } },
    superAdmin: { role: { val: ['super-admin'], required: true } , isAdult: { val: true, required: true } },
    adminRolesOrCurrentAdult: { currentUser: { val: true }, role: { val: ['admin', 'super-admin'] }, isAdult: { val: true, required: true } },
    adminRolesCurrentAdultOrGuardian: { isGuardian: { val: true }, currentUser: { val: true }, role: { val: ['admin', 'super-admin'] }, isAdult: { val: true, required: true } },
    adminRolesCurrentUserOrGuardian: { isGuardian: { val: true }, currentUser: { val: true }, role: { val: ['admin', 'super-admin'] } },
    adminRolesCurrentUserOrRelated: { isGuardian: { val: true }, isFriend: { val: true }, currentUser: { val: true }, role: { val: ['admin', 'super-admin'] } },
    currentAdultOrGuardian: { isGuardian: { val: true }, currentUser: { val: true }, isAdult: { val: true, required: true } },
    currentUserAndAdult: { currentUser: { val: true, required: true }, isAdult: { val: true, required: true } },
    currentUserAndGuardian: { currentUser: { val: true, required: true } , isAdult: { val: true, required: true }, isGuardian: { val: true, required: true } },
    currentUser: { currentUser: { val: true, required: true } },
    adminRolesOrAnyCurrentUser: { currentUser: { val: true, required: true }, role: { val: ['admin', 'super-admin'] } }
};