var sinon = require('sinon');
var should = require('chai').should();
var proxyquire = require('proxyquire');
var utils = require('../../utilities/testUtilities');
var promiseSvc = require('../../../services/promises/promiseService');
var functionUtil = require('../../../utilities/functionUtilities');

describe('services', function () {
    describe('authentication', function () {

        var sandbox;
        var passport, BasicStrategy, userSvc, serverSvcStub, passportSvc;
        describe('passportService.js', function () {

            beforeEach(function() {

                sandbox = sinon.sandbox.create();
                passport = sandbox.stub({
                    use: function() {},
                    initialize: function() {},
                    authenticate: function () {}
                });
                BasicStrategy = sandbox.stub({
                    BasicStrategy: {

                    }
                });
                userSvc = sandbox.stub(require('../../../services/authentication/userService'));

                serverSvcStub = sandbox.stub({
                    addMiddleware: function() {

                    }
                });
                passportSvc = proxyquire('../../../services/authentication/passportService',
                    { passport: passport, BasicStrategy: BasicStrategy, userSvc: userSvc });

            });

            describe('userLookupForStrategy', function() {

                it('calls getSingle on userSvc with username', function() {
                    var userName = utils.getRandomString(10);
                    userSvc.getSingle = promiseSvc.makeEmptyPromise(userSvc.getSingle);
                    passportSvc.userLookupForStrategy(userName, '', function() {});
                    sinon.assert.calledWithExactly(userSvc.getSingle, userName);
                });


                it('returns the user when authenticate succeeds', function(done) {

                    var userName = utils.getRandomString(10);
                    var userStub = {
                        userName: userName,
                        authenticate: sandbox.stub()
                    };
                    userStub.authenticate = promiseSvc.wrapWithPromise(userStub.authenticate)
                        .resolvingWith(true);
                    userSvc.getSingle = promiseSvc.wrapWithPromise(userSvc.getSingle)
                        .resolvingWith(userStub);


                    passportSvc.userLookupForStrategy(userName, '', function(other, user) {
                        should.exist(user);
                        should.not.exist(other);
                        user.userName.should.equal(userName);
                        done();
                    });

                });
                it('returns null when authenticate does not match user', function(done) {
                    var userName = utils.getRandomString(10);
                    var userStub = {
                        userName: userName,
                        authenticate: sandbox.stub()
                    };
                    userSvc.getSingle = promiseSvc.wrapWithPromise(userSvc.getSingle)
                        .resolvingWith(null);

                    passportSvc.userLookupForStrategy(userName, '', function(user, other) {
                        should.not.exist(user);
                        other.should.equal(false);
                        done();
                    });

                });


                it('returns an error when authenticate gets error', function(done) {

                    var userName = utils.getRandomString(10);
                    var userStub = {
                        userName: userName,
                        authenticate: sandbox.stub()
                    };
                    var randomErrString = utils.getRandomString(16);

                    userStub.authenticate = promiseSvc.wrapWithPromise(userStub.authenticate)
                        .rejectingWith(randomErrString);
                    userSvc.getSingle = promiseSvc.wrapWithPromise(userSvc.getSingle)
                        .resolvingWith(userStub);

                    passportSvc.userLookupForStrategy(userName, '', function(err) {
                        err.should.equal(randomErrString);
                        done();
                    });

                });

                it('returns an error when getSingle rejects', function(done) {

                    var userName = utils.getRandomString(10);
                    var randomErrString = utils.getRandomString(16);
                    userSvc.getSingle = promiseSvc.wrapWithPromise(userSvc.getSingle)
                        .rejectingWith(randomErrString);

                    passportSvc.userLookupForStrategy(userName, '', function(err) {
                       err.should.equal(randomErrString);
                       done();
                    });


                });
            });

            describe('initialize', function() {

                it('sets up passport', function() {
                    passportSvc.initialize(serverSvcStub);
                    sinon.assert.calledOnce(passport.use);
                    sinon.assert.calledOnce(passport.initialize);
                });

                it('adds server service to middleware', function() {
                    var retVal = utils.getRandomString(10);
                    passport.initialize.returns(retVal);
                    passportSvc.initialize(serverSvcStub);
                    sinon.assert.calledWith(serverSvcStub.addMiddleware, retVal);
                });
            });


            describe('authenticateMethod', function() {
                it('calls passport authenticate', function() {
                   passportSvc.authenticateMethod();
                   sinon.assert.calledWithExactly(passport.authenticate, 'basic', { session: false });
                });
                it('returns the results of passport authenticate', function() {
                   var authRet = utils.getRandomString(10);
                   passport.authenticate.returns(authRet);
                   var ret = passportSvc.authenticateMethod();
                   ret.should.equal(authRet);
                });
            });

            afterEach(function() {
                sandbox.restore();
            });

        });


    });
});
