var passport = require('passport');
var BasicStrategy = require('passport-http').BasicStrategy;
var userSvc = require('./userService');

function initialize(serverSvc) {

    //Gets a user given a username and password
    passport.use(new BasicStrategy(
        function (username, password, done) {
            userSvc.getSingle(username)
                .then(function(user) {
                    if (user) {
                        user.authenticate(password)
                            .then(function(isMatch) {
                                return done(null, isMatch ? user : null);
                            })
                            .fail(function(err) {
                                return done(err);
                            });
                    } else {
                        return done(null, false);
                    }
                })
                .fail(function(err) {
                   return done(err);
                });

        }
    ));

    this.addToServer(serverSvc);
}
module.exports.initialize = initialize;



function addToServer(serverSvc) {

    //Add passport to the server service
    if (serverSvc && serverSvc.addMiddleware)
        serverSvc.addMiddleware(passport.initialize(), 'passport');

}
module.exports.addToServer = addToServer;

function authenticateMethod() {

    return passport.authenticate('basic', { session: false });

}

module.exports.authenticateMethod = authenticateMethod;

