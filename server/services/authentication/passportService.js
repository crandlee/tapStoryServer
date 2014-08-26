"use strict";
require('require-enhanced')();

var passport = require('passport');
var BasicStrategy = require('passport-http').BasicStrategy;
var userSvc = global.rootRequire('svc-user');

function userLookupForStrategy(username, password, done) {
    userSvc.getSingle(username)
        .done(function (user) {
            if (user) {
                user.authenticate(password)
                    .done(function (isMatch) {
                        return done(null, isMatch ? user : null);
                    },function (err) {
                        return done(err);
                    });
            } else {
                return done(null, false);
            }
        }, function (err) {
            return done(err);
        });

}

function initialize(serverSvc) {
    passport.use(new BasicStrategy(userLookupForStrategy));

    //Add passport to the server service
    if (serverSvc && serverSvc.addMiddleware)
        serverSvc.addMiddleware(passport.initialize(), 'passport');
}


function authenticateMethod() {
    return passport.authenticate('basic', { session: false });
}


function _setUserService(service) {
    userSvc = service;
}

module.exports = {
    authenticateMethod: authenticateMethod,
    initialize: initialize,
    userLookupForStrategy: userLookupForStrategy,
    _setUserService: _setUserService
};