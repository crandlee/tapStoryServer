var authSvc = require('../../services/authentication/passportService');
var passport = require('passport');

function authenticate(req, res) {

   console.log(req);
   res.json( { firstName: req.user.firstName, lastName: req.user.lastName });

}
module.exports.authenticate = authenticate;

module.exports.authenticateMethod = function() {
    return authSvc.authenticateMethod();
};
