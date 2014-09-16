"use strict";
var cb = require('common-bundle')({test:true});
var should = cb.should;
var sinon = cb.sinon;
var testUtils = cb.testUtils;
var promiseUtils = cb.promiseUtils;

var enc = cb.rootRequire('util-encryption');

describe('utilities/encryptionUtility.js', function () {


    var testSalt = '$2a$10$PgbZyyejZthZd9r23j/iUO';
    var testSecret = 'secret123@';

    describe('createSalt', function () {
        it('creates a valid salt', function (done) {

            enc.createSalt().fin(done).done(function (salt) {
                should.exist(salt);
            });

        });
    });

    describe('hashPwd', function () {

        it('properly hashes a password', function (done) {
            enc.hashPwd(testSecret, testSalt).fin(done).done(function (token) {
                should.exist(token);
            });
        });

        it('should return the same token on multiple runs w/ same input', function (done) {
            function enc1() {
                return enc.hashPwd(testSecret, testSalt);
            }

            function enc2() {
                return enc.hashPwd(testSecret, testSalt);
            }

            cb.Promise.all([enc1(), enc2()])
                .spread(function (token1, token2) {
                    should.exist(token1);
                    should.exist(token2);
                    token1.should.equal(token2);
                })
                .fin(done).done();
        });

    });

    describe('saltAndHash', function () {

        it('returns a salted and hashed token', function (done) {

            enc.saltAndHash(testSecret).should.be.fulfilled
                .then(function (hash) {
                    should.exist(hash);
                }).should.notify(done);


        });
        it('returns a different token on multiple runs', function (done) {

            function enc1() {
                return enc.saltAndHash(testSecret);
            }

            function enc2() {
                return enc.saltAndHash(testSecret);
            }

            cb.Promise.all([enc1(), enc2()])
                .spread(function (token1, token2) {
                    should.exist(token1);
                    should.exist(token2);
                    token1.should.not.equal(token2);
                })
                .fin(done).done();

        });
    });
    describe('checkEqualToken', function () {
        it('matches same token with hashed token', function (done) {

            enc.saltAndHash(testSecret)
                .then(function (token1) {
                    should.exist(token1);
                    enc.checkEqualToken(testSecret, token1).then(function (isMatch) {
                        should.exist(isMatch);
                        isMatch.should.equal(true);
                    }).should.notify(done);
                });

        });
        it('not match different token with hashed token', function (done) {
            enc.saltAndHash(testSecret)
                .then(function (token1) {
                    should.exist(token1);
                    enc.checkEqualToken('Some other secret', token1).then(function (isMatch) {
                        should.exist(isMatch);
                        isMatch.should.equal(false);
                    }).should.notify(done);
                });

        });
    });

});