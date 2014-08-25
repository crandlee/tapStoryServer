"use strict";
require('require-enhanced')({ test: true });


describe('services/authentication/passportService.js', function () {
    describe('authentication', function () {

        var sinon = global.sinon, sandbox;
        var passport, BasicStrategy, userSvc, serverSvcStub, passportSvc;
        global.errSvc.bypassLogger(true);

        beforeEach(function () {

            sandbox = sinon.sandbox.create();
            passport = sandbox.stub({
                use: function () {
                },
                initialize: function () {
                },
                authenticate: function () {
                }
            });
            BasicStrategy = sandbox.stub({
                BasicStrategy: {

                }
            });
            userSvc = sandbox.stub(global.rootRequire('svc-user'));

            serverSvcStub = sandbox.stub({
                addMiddleware: function () {

                }
            });
            passportSvc = global.proxyquire(global.getRoutePathFromKey('svc-passport'),
                { passport: passport, BasicStrategy: BasicStrategy, userSvc: userSvc });

        });

        describe('userLookupForStrategy', function () {

            it('calls getSingle on userSvc with username and resolves a user', function (done) {

                var userName = global.testUtils.getRandomString(10);
                var user = {
                  authenticate: global.promiseUtils.getResolveExactlyPromiseStub(true)
                };
                userSvc.getSingle = global.promiseUtils.getResolveExactlyPromiseStub(user);
                passportSvc._setUserService(userSvc);
                passportSvc.userLookupForStrategy(userName, '',
                    function (val, retUser) {
                        global.should.not.exist(val);
                        retUser.should.equal(user);
                    }
                );
                userSvc.getSingle()
                    .then(function(ret) {
                        ret.args[0].should.equal(userName);
                        return ret.authenticate()
                            .then(function(isMatch) {
                                isMatch.should.equal(true);
                            })
                            .fail(function(err) {
                                throw err;
                            });
                    })
                    .fail(function(err) {
                        throw err;
                    })
                    .fin(done)
                    .done();


            });



            it('returns null when authenticate does not match user', function (done) {

                var userName = global.testUtils.getRandomString(10);
                userSvc.getSingle = global.promiseUtils.getResolveNullPromiseStub();

                passportSvc._setUserService(userSvc);
                passportSvc.userLookupForStrategy(userName, '',
                    function (val,user) {
                        global.should.not.exist(val);
                        user.should.equal(false);
                    }
                );
                userSvc.getSingle()
                    .then(function(ret) {
                        global.should.not.exist(ret);
                    })
                    .fail(function(err) {
                        throw err;
                    })
                    .fin(done)
                    .done();

            });


            it('returns an error when authenticate gets error', function (done) {

                var userName = global.testUtils.getRandomString(10);
                var testError = global.testUtils.getRandomString(10);
                var user = {
                    authenticate: global.promiseUtils.getRejectExactlyPromiseStub(testError)
                };
                userSvc.getSingle = global.promiseUtils.getResolveExactlyPromiseStub(user);
                passportSvc._setUserService(userSvc);
                passportSvc.userLookupForStrategy(userName, '',
                    function (err) {
                        err.message.should.equal(testError);
                    }
                );
                userSvc.getSingle()
                    .then(function(ret) {
                        ret.args[0].should.equal(userName);
                        return ret.authenticate()
                            .then(function() {
                                throw new Error('Resolved when should have rejected');
                            })
                            .fail(function(err) {
                                err.message.should.equal(testError);
                            });
                    })
                    .fail(function(err) {
                        throw err;
                    })
                    .fin(done)
                    .done();

            });

            it('returns an error when getSingle rejects', function (done) {

                var userName = global.testUtils.getRandomString(10);
                var testError = global.testUtils.getRandomString(10);
                userSvc.getSingle = global.promiseUtils.getRejectExactlyPromiseStub(testError);
                passportSvc._setUserService(userSvc);
                passportSvc.userLookupForStrategy(userName, '',
                    function (err) {
                        err.message.should.equal(testError);
                    }
                );
                userSvc.getSingle()
                    .then(function() {
                        throw new Error('Resolved when should have rejected');
                    })
                    .fail(function(err) {
                        err.message.should.equal(testError);
                    })
                    .fin(done)
                    .done();


            });
        });

        describe('initialize', function () {

            it('sets up passport', function () {
                passportSvc.initialize(serverSvcStub);
                sinon.assert.calledOnce(passport.use);
                sinon.assert.calledOnce(passport.initialize);
            });

            it('adds server service to middleware', function () {
                var retVal = global.testUtils.getRandomString(10);
                passport.initialize.returns(retVal);
                passportSvc.initialize(serverSvcStub);
                sinon.assert.calledWith(serverSvcStub.addMiddleware, retVal);
            });
        });


        describe('authenticateMethod', function () {
            it('calls passport authenticate', function () {
                passportSvc.authenticateMethod();
                sinon.assert.calledWithExactly(passport.authenticate, 'basic', { session: false });
            });
            it('returns the results of passport authenticate', function () {
                var authRet = global.testUtils.getRandomString(10);
                passport.authenticate.returns(authRet);
                var ret = passportSvc.authenticateMethod();
                ret.should.equal(authRet);
            });
        });

        afterEach(function () {
            sandbox.restore();
        });

    });


});
