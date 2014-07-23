var authSvc = require('../../services/authentication/passportService');


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
