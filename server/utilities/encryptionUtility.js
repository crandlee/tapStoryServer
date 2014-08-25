"use strict";
require('require-enhanced')();

var bcrypt = require('bcrypt');

function createSalt(rounds) {
    rounds = rounds || 11;
    return global.Promise.denodeify(bcrypt.genSalt)(rounds);
}

function hashPwd(pwd, salt) {
    return global.Promise.denodeify(bcrypt.hash)(pwd, salt);
}

function saltAndHash(pwd) {
    //promise
    return createSalt()
        .then(global._.partial(hashPwd, pwd))
        .then(function(hash) {
            return hash;
        });
}


function checkEqualToken(candidate, existing) {
    return global.Promise.denodeify(bcrypt.compare)(candidate, existing);
}

module.exports = {

    createSalt: createSalt,
    hashPwd: hashPwd,
    saltAndHash: saltAndHash,
    checkEqualToken: checkEqualToken

};