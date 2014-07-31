var chai = require('chai');
var should = chai.should();
var chaiAsPromised = require('chai-as-promised');
chai.use(chaiAsPromised);

describe('Utilities Tests', function () {
    describe('encryption.js', function () {
        var enc = require('../../utilities/encryptionUtility');
        var testSalt = '$2a$10$PgbZyyejZthZd9r23j/iUO';
        var testSecret = 'secret123@';
        this.timeout(1000);
        describe('createSalt', function () {
            it('creates a valid salt', function (done) {
                enc.createSalt().then(function (salt) {
                    should.exist(salt);
                    done();
                });

            });
        });
        describe('hashPwd', function () {
            it('properly hashes a password', function (done) {
                enc.hashPwd(testSalt, testSecret).then(function (token) {
                    should.exist(token);
                    done();
                });
            });
            it('should return the same token on multiple runs w/ same input', function(done) {
                enc.hashPwd(testSalt, testSecret).then(function (token1) {
                    should.exist(token1);
                    enc.hashPwd(testSalt, testSecret).then(function (token2) {
                        should.exist(token2);
                        token1.should.equal(token2);
                        done();
                    });
                });
            });
        });
        describe('saltAndHash', function () {
            it('returns a salted and hashed token', function (done) {
                enc.saltAndHash(testSecret).should.be.fulfilled
                    .then(function(hash) {
                        should.exist(hash);
                    }).should.notify(done);

            });
            it('returns a different token on multiple runs', function (done) {

                enc.saltAndHash(testSecret)
                    .then(function(token1) {
                        should.exist(token1);
                        enc.saltAndHash(testSecret).then(function (token2) {
                            should.exist(token2);
                            token1.should.not.equal(token2);
                        }).should.notify(done);
                    });
            });
        });
        describe('checkEqualToken', function() {
            it('matches same token with hashed token', function(done) {
                enc.saltAndHash(testSecret)
                    .then(function(token1) {
                        should.exist(token1);
                        enc.checkEqualToken(testSecret, token1).then(function (isMatch) {
                            should.exist(isMatch);
                            isMatch.should.equal(true);
                        }).should.notify(done);
                    });

            });
            it('not match different token with hashed token', function(done) {
                enc.saltAndHash(testSecret)
                    .then(function(token1) {
                        should.exist(token1);
                        enc.checkEqualToken('Some other secret', token1).then(function (isMatch) {
                            should.exist(isMatch);
                            isMatch.should.equal(false);
                        }).should.notify(done);
                    });

            });
        });

    });
});