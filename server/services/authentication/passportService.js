"use strict";

var passport = require('passport');
var BasicStrategy = require('passport-http').BasicStrategy;
var userSvc = require('./userService');

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

module.exports.userLookupForStrategy = userLookupForStrategy;

function initialize(serverSvc) {

    passport.use(new BasicStrategy(userLookupForStrategy));

    //Add passport to the server service
    if (serverSvc && serverSvc.addMiddleware)
        serverSvc.addMiddleware(passport.initialize(), 'passport');

}
module.exports.initialize = initialize;


function authenticateMethod() {

    return passport.authenticate('basic', { session: false });
}

module.exports.authenticateMethod = authenticateMethod;

