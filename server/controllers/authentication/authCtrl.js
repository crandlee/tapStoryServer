"use strict";
require('require-enhanced')();

var authSvc = global.rootRequire('svc-passport');


function authenticateMethod() {
    return authSvc.authenticateMethod();
}

function authorizeMethod(role) {
    return function(req, res, next) {
        if (req.user && req.user.hasRole(role)) {
            return next();
        } else {
            res.status(403);
            res.end();
        }
    };
}

module.exports = {
    authenticateMethod: authenticateMethod,
    authorizeMethod: authorizeMethod
};