var bcrypt = require('bcrypt');
var promiseSvc = require('../services/promises/promiseService');

function createSalt() {

    var pid = promiseSvc.createPromise();

    bcrypt.genSalt(11, function(err, salt) {
        if (err) {
            promiseSvc.reject(new Error(err), pid);
        } else {
            promiseSvc.resolve(salt, pid);
        }
    });
    return promiseSvc.getPromise(pid);
}
module.exports.createSalt = createSalt;

function hashPwd(salt, pwd) {
    var pid = promiseSvc.createPromise()
    bcrypt.hash(pwd, salt, function(err, hash) {
       if (err) {
           promiseSvc.reject(new Error(err), pid);
       } else {
           promiseSvc.resolve(hash, pid);
       }
    });
    return promiseSvc.getPromise(pid);
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
    var pid = promiseSvc.createPromise();
    bcrypt.compare(candidate, existing, function(err, isMatch) {
       if (err) {
           promiseSvc.reject(new Error(err), pid);
       } else {
           promiseSvc.resolve(isMatch, pid);
       }
    });
    return promiseSvc.getPromise(pid);
}
module.exports.checkEqualToken = checkEqualToken;