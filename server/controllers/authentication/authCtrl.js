var authSvc = require('../../services/authentication/passportService');

function authenticate(req, res) {

   res.json( { success: true });

}

module.exports.authenticate = authenticate;

module.exports.authenticateMethod = function() {
    return authSvc.authenticateMethod();
};

module.exports.authorizeMethod = function(role) {
    return function(req, res, next) {
        if (req.user && req.user.hasRole(role)) {
            return next();
        } else {
            res.status(403);
            res.end();
        }
    }
};
