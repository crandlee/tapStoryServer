"use strict";

var cb = require('common-bundle')();
var authSvc = cb.rootRequire('svc-passport');
var userRelSvc = cb.rootRequire('svc-rel');
var ctrlHelper = cb.rootRequire('ctrl-helper');
var _ = cb._;
var enums = cb.rootRequire('enums');
var userSvc = cb.rootRequire('svc-user');

function authenticate() {
    return authSvc.authenticateMethod();
}

function authorizeMethod(listTestClusters, options, req, res, next) {

    listTestClusters = listTestClusters || {};
    options = options || {};

    var authStatuses = Object.freeze({ failed: false, passed: true, requireFailed: 'requireFail' });
    var testsRun = [];

    var runTestClusterList = function(listTestClusters, dataToCheck, options, testsRun) {
        var testLibrary = possibleTests(options, dataToCheck);
        return cb.Promise.all(_.map(listTestClusters, function(testCluster) {
           return runTestCluster(testCluster, dataToCheck, testLibrary, testsRun);
        })).then(function(resultsInList) {
            return (!_(resultsInList).some(function(status) { return status === authStatuses.requireFailed; })
                && (_(resultsInList).some(function(status) { return status === authStatuses.passed })));
        });
    };

    var runTestCluster = function(testCluster, dataToCheck, testLibrary, testsRun) {
        return cb.Promise.all(_.chain(testCluster).keys().map(function(key) {
            return cb.Promise.fcall(testLibrary[key], testCluster[key]);
        }).value()).then(function(resultsInCluster) {
            testsRun.push(_.zipObject(_.keys(testCluster), resultsInCluster));
            return cb.Promise(_(resultsInCluster).some(function(status) { return status === authStatuses.requireFailed; })
                ? authStatuses.requireFailed
                : _(resultsInCluster).every(function(status) { return status === authStatuses.passed }));
        });
    };

    var possibleTests = function(options, d) {
        var targetUser = (d.body.relUser || d.body.userName || '');

        return {
            role: function(testVal) {
                return d.currentUser.hasRole(testVal);
            },
            isAdult: function(testVal) {
                return d.currentUser.isMinor !== testVal;
            },
            currentUser: function(testVal) {
                return (d.currentUser.userName.toLowerCase() === d.params.userName.toLowerCase()) === testVal;
            },
            allowInactive: function(testVal) {
                return testVal ? true : d.currentUser.isActive;
            },
            isGuardian: function(testVal) {
                if (d.currentUser.userName.toLowerCase() !== d.params.userName.toLowerCase()) {
                    return userSvc.getSingle(d.params.userName)
                        .then(function(user) {
                            if (!user) return authStatuses.requireFailed;
                            var required = user.isMinor && testVal === 'strict';
                            return userRelSvc.isRelated([enums.relationships.guardian, enums.relationships.child], d.currentUser.userName, targetUser, options)
                                .then(function(isGuardian) {
                                    if (required && (!isGuardian)) return authStatuses.requireFailed;
                                    return isGuardian;
                                });
                        });
                } else {
                    return false;
                }
            },
//            isFriend: function(testVal) {
//                return userRelSvc.isRelated([enums.relationships.friend], d.currentUser.userName, targetUser, options)
//                    .then(function(isFriend) { return isFriend === testVal});
//            },
            isRelated: function(testVal) {
                return userRelSvc.isRelated(null, d.currentUser.userName, targetUser, options)
                    .then(function(isRelated) { return isRelated === testVal});
            },
            isSubscribed: function(testVal) {
                if (!d.params.groupId) return false;
                return userSvc.getSharedFileGroup(d.params.userName, d.params.groupId, d.currentUser.userName)
                    .then(function(fileGroup) {
                        return (!!fileGroup === testVal);
                    })
            }
        };
    };

//    var authorizationPasses = function(testCluster, dataToCheck) {
//
//
//        var testInvocationList = [];
//        var testLibrary = possibleTests(authObj, vals);
//        _(authObj).forOwn(function(obj, key) {
//            testsRun.push(key);
//            testInvocationList.push(
//                cb.Promise.fcall(testLibrary[key],(obj.val))
//                    .then(function(passed) {
//                        if (!passed && obj.required) return cb.Promise(authStatuses.requireFailed);
//                        return cb.Promise(passed);
//                    })
//            );
//        });
//        return cb.Promise.all(testInvocationList)
//            .then(function(allTests) {
//                testsRun = _.zipObject(testsRun, allTests);
//                return (!_(allTests).some(function(status) { return status === authStatuses.requireFailed; })
//                    && (_(allTests).some(function(status) { return status === authStatuses.passed })));
//            });
//
//    };

    var afterAuthenticate = function () {

        var user = req.user;
        var dataToCheck = {};

        if (!user) {
            ctrlHelper.setUnauthorized(res);
            next();
        } else {

            dataToCheck.params = req.params || {};
            dataToCheck.body = req.body || {};
            dataToCheck.currentUser = req.user;

            runTestClusterList(listTestClusters, dataToCheck, options, testsRun)
                .then(function(passed) {
                    if (!passed) {
                        res.setHeader('X-Auth-Tested', JSON.stringify(testsRun));
                        ctrlHelper.setForbidden(res,
                            'The current user is not authorized to run this operation on this resource');
                    }
                    return next(passed);
                })
                .fail(function(err) {
                    ctrlHelper.setInternalError(res, err);
                    return next(false);
                })
                .done();

        }

    };

    var auth = authSvc.authenticateMethod(req, res, next);
    auth(req, res, afterAuthenticate);

}


function authorize(neededTestList, options) {

    return _.partial(authorizeMethod, neededTestList, options);

}

//Also exports some common role configurations for use in setup
//on the routers
module.exports = {
    authenticate: authenticate,
    authorize: authorize
//    Admin: { role: { val: ['admin', 'super-admin'], required: true },
//    adminRoles: { role: { val: ['admin', 'super-admin'], required: true } , isAdult: { val: true, required: true } },
//    superAdmin: { role: { val: ['super-admin'], required: true } , isAdult: { val: true, required: true } },
//    adminRolesOrCurrentAdult: { currentUser: { val: true }, role: { val: ['admin', 'super-admin'] }, isAdult: { val: true, required: true } },
//    adminRolesCurrentAdultOrGuardian: { isGuardian: { val: true }, currentUser: { val: true }, role: { val: ['admin', 'super-admin'] }, isAdult: { val: true, required: true } },
//    adminRolesCurrentUserOrGuardian: { isGuardian: { val: true }, currentUser: { val: true }, role: { val: ['admin', 'super-admin'] } },
//    adminRolesCurrentUserOrRelated: { isGuardian: { val: true }, isFriend: { val: true }, currentUser: { val: true }, role: { val: ['admin', 'super-admin'] } },
//    currentAdultOrGuardian: { isGuardian: { val: true }, currentUser: { val: true }, isAdult: { val: true, required: true } },
//    currentUserAndAdult: { currentUser: { val: true, required: true }, isAdult: { val: true, required: true } },
//    currentUserAndGuardian: { currentUser: { val: true, required: true } , isAdult: { val: true, required: true }, isGuardian: { val: true, required: true } },
//    currentUser: { currentUser: { val: true, required: true } }
};