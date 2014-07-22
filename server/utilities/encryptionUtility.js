var bcrypt = require('bcrypt');
var Q = require('q');

function createSalt() {

    var deferred = Q.defer();

    bcrypt.genSalt(11, function(err, salt) {
        if (err) {
            deferred.reject(new Error(err))
        } else {
            deferred.resolve(salt);
        }
    });
    return deferred.promise;
}
module.exports.createSalt = createSalt;

function hashPwd(salt, pwd) {
    var deferred = Q.defer();
    bcrypt.hash(pwd, salt, function(err, hash) {
       if (err) {
           deferred.reject(new Error(err));
       } else {
           deferred.resolve(hash);
       }
    });
    return deferred.promise;
}
module.exports.hashPwd = hashPwd;

function saltAndHash(pwd) {

    return createSalt()
        .then(function(salt) {
            return hashPwd(salt, pwd);
        })
        .then(function(hash) {
            return hash;
        });
}

module.exports.saltAndHash = saltAndHash;

function checkEqualToken(candidate, existing) {
    var deferred = Q.defer();
    bcrypt.compare(candidate, existing, function(err, isMatch) {
       if (err) {
           deferred.reject(new Error(err));
       } else {
           deferred.resolve(isMatch);
       }
    });
    return deferred.promise;
}
module.exports.checkEqualToken = checkEqualToken;