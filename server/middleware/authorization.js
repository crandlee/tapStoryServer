"use strict";

var cb = require('common-bundle')();
var authSvc = cb.rootRequire('svc-passport');
var userRelSvc = cb.rootRequire('svc-rel');
var ctrlHelper = cb.rootRequire('ctrl-helper');
var _ = cb._;
var enums = cb.rootRequire('enums');
var userSvc = cb.rootRequire('svc-user');
var errSvc = cb.errSvc;

function authenticate() {
    return authSvc.authenticateMethod();
}

function authorizeMethod(listTestClusters, options, req, res, next) {

    listTestClusters = listTestClusters || {};
    options = options || {};

    var authStatuses = Object.freeze({ failed: false, passed: true, requireFailed: 'requireFail' });
    var testsRun = [];

    var runTestClusterList = function (listTestClusters, dataToCheck, options, testsRun) {
        var testLibrary = possibleTests(options, dataToCheck);
        return cb.Promise.all(_.map(listTestClusters, function (testCluster) {
            return runTestCluster(testCluster, dataToCheck, testLibrary, testsRun);
        })).then(function (resultsInList) {
            return (!_(resultsInList).some(function (status) {
                return status === authStatuses.requireFailed;
            })
                && (_(resultsInList).some(function (status) {
                    return status === authStatuses.passed
                })));
        });
    };

    var runTestCluster = function (testCluster, dataToCheck, testLibrary, testsRun) {
        return cb.Promise.all(_.chain(testCluster).keys().map(function (key) {
            return cb.Promise.fcall(testLibrary[key], testCluster[key]);
        }).value()).then(function (resultsInCluster) {
            testsRun.push(_.zipObject(_.keys(testCluster), resultsInCluster));
            return cb.Promise(_(resultsInCluster).some(function (status) {
                return status === authStatuses.requireFailed;
            })
                ? authStatuses.requireFailed
                : _(resultsInCluster).every(function (status) {
                return status === authStatuses.passed
            }));
        });
    };

    var possibleTests = function (options, d) {

        return {
            isAuth: function (testVal) {
                return !!(d.currentUser) === testVal;
            },
            role: function (testVal) {
                return d.currentUser.hasRole(testVal);
            },
            isAdult: function (testVal) {
                return d.currentUser.isMinor !== testVal;
            },
            currentUser: function (testVal) {
                if (!d.currentUser || !d.currentUser.userName) return (testVal === false);
                if (!d.params || !d.params.userName) return (testVal === false);
                return (d.currentUser.userName.toLowerCase() === d.params.userName.toLowerCase()) === testVal;
            },
            allowInactive: function (testVal) {
                return testVal ? true : d.currentUser.isActive;
            },
            isGuardian: function (testVal) {
                if (!d.currentUser || !d.currentUser.userName) return (testVal === false);
                if (!d.params || !d.params.userName) return (testVal === false);
                if (d.currentUser.userName.toLowerCase() !== d.params.userName.toLowerCase()) {
                    return userSvc.getSingle(d.params.userName, options)
                        .then(function (user) {
                            if (!user) return authStatuses.requireFailed;
                            var required = user.isMinor && testVal === 'strict';
                            return userRelSvc.isRelated([enums.relationships.guardian, enums.relationships.child], d.currentUser.userName, d.params.userName, options)
                                .then(function (isGuardian) {
                                    if (required && (!isGuardian)) return authStatuses.requireFailed;
                                    return isGuardian;
                                });
                        });
                } else {
                    return false;
                }
            },
            hasMultipleGuardians: function(testVal) {
                if (!d.params || !d.params.userName) return (testVal === false);
                return userRelSvc.getRelationships(d.params.userName,
                    enums.relationships.guardian, [enums.statuses.active])
                    .then(function(rels) {
                       return (rels.length > 1) === testVal;
                    });
            },
//            isFriend: function(testVal) {
//                return userRelSvc.isRelated([enums.relationships.friend], d.currentUser.userName, targetUser, options)
//                    .then(function(isFriend) { return isFriend === testVal});
//            },
            isRelated: function (testVal) {
                if (!d.currentUser || !d.currentUser.userName) return (testVal === false);
                if (!d.params || !d.params.userName) return (testVal === false);
                return userRelSvc.isRelated(null, d.currentUser.userName, d.params.userName, options)
                    .then(function (isRelated) {
                        return isRelated === testVal
                    });
            },
            isSubscribed: function (testVal) {
                if (!d.params || !d.params.groupId) return false;
                if (!d.currentUser || !d.currentUser.userName) return false;
                return userSvc.getShares(d.params.userName, d.params.groupId, d.params.relUser || d.currentUser.userName)
                    .then(function (fileGroup) {
                        return (!!fileGroup === testVal);
                    })
            }
        };
    };


    var afterAuthenticate = function (req, res, next, opts) {
        var user = req.user;
        var dataToCheck = {};
        opts = opts || {};
        dataToCheck.params = req.params || {};
        dataToCheck.body = req.body || {};
        dataToCheck.currentUser = user || { userName: '' };
        if (opts.checkUser && !user) {
            if (cb.env === 'development') res.setHeader('X-Auth-Tested', 'No user');
            next(false);
        } else {
            runTestClusterList(listTestClusters, dataToCheck, options, testsRun)
                .then(function (passed) {
                    if (cb.env === 'development') res.setHeader('X-Auth-Tested', JSON.stringify(testsRun));
                    if (!passed) {
                        ctrlHelper.setForbidden(res,
                            'The current user is not authorized to run this operation on this resource');
                    }
                    next(passed);
                })
                .fail(_.partial(ctrlHelper.setInternalError, res))
                .done();

        }


    };

    if (listTestClusters.length === 1 && listTestClusters[0] === enums.auth.Guest) {
        afterAuthenticate(req, res, next, { checkUser: false });
    } else {
        var auth = authSvc.authenticateMethod(req, res, next);
        auth(req, res, _.partial(afterAuthenticate, req, res, next, { checkUser: true }));
    }

}


function authorize(neededTestList, options) {

    return _.partial(authorizeMethod, neededTestList, options);

}

//Also exports some common role configurations for use in setup
//on the routers
module.exports = {
    authenticate: authenticate,
    authorize: authorize
};