var passport = require('passport');
var BasicStrategy = require('passport-http').BasicStrategy;

function initialize(serverSvc) {

    //Gets a user given a username and password
    passport.use(new BasicStrategy(
        function (username, password, done) {
//            User.findOne({userName: username}).exec(function (err, user) {
//                if (user && user.authenticate(password)) {
//                    return done(null, user);
//                } else {
//                    return done(null, false);
//                }
//            });
                console.log("Strategy: " + username);
                return done(null, { firstName: 'Randy', lastName: 'Lee' });

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

