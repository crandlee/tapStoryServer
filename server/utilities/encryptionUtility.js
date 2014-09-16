"use strict";
var cb = require('common-bundle')();
var promise = cb.Promise;
var _ = cb._;

var bcrypt = require('bcrypt');

function createSalt(rounds) {
    rounds = rounds || 11;
    return promise.denodeify(bcrypt.genSalt)(rounds);
}

function hashPwd(pwd, salt) {
    return promise.denodeify(bcrypt.hash)(pwd, salt);
}

function saltAndHash(pwd) {
    //promise
    return createSalt()
        .then(_.partial(hashPwd, pwd))
        .then(function(hash) {
            return hash;
        });
}


function checkEqualToken(candidate, existing) {
    return promise.denodeify(bcrypt.compare)(candidate, existing);
}

module.exports = {

    createSalt: createSalt,
    hashPwd: hashPwd,
    saltAndHash: saltAndHash,
    checkEqualToken: checkEqualToken

};