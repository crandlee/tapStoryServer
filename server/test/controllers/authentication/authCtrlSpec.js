"use strict";
var cb = require('common-bundle')({test:true});
var should = cb.should;
var sinon = cb.sinon;
var testUtils = cb.testUtils;

describe.only('controllers/authentication/authCtrlSpec.js', function() {

        var sandbox;
        var authSvcStub, authMdl, resStub, reqStub, nextStub;

        beforeEach(function() {

            sandbox = sinon.sandbox.create();
            authSvcStub = sandbox.stub(cb.rootRequire('svc-passport'));
            authMdl = cb.proxyquire(cb.getRoutePathFromKey('mdl-auth'), { authSvc: authSvcStub });
            resStub  = sandbox.stub({
                status: function() {},
                send: function() {},
                end: function() {}
            });
            reqStub = sandbox.stub({
               user: sandbox.stub({
                   hasRole: function() {}
               })
            });
            nextStub = sandbox.stub();

        });

        describe('authenticateMethod', function() {

            it('returns whatever the authenticateService returns', function() {

                var testData = { TestObj: true };
                authSvcStub.authenticateMethod.returns(testData);
                var ret = authMdl.authenticateMethod(reqStub, resStub, nextStub);
                sinon.assert.calledOnce(authSvcStub.authenticateMethod);
                ret.should.equal(testData);

            });

        });


        describe('authorize', function() {

            var fn = null;

            it('returns a function', function() {
                fn = authMdl.authorize();
                should.exist(fn);
                fn.should.be.a('function');
            });

            it('passes a role to the hasRole method', function() {

                var testRole = 'arbitraryRole';
                fn = authMdl.authorize(testRole);
                fn(reqStub, resStub, nextStub);
                sinon.assert.calledWith(reqStub.user.hasRole, testRole);

            });

            it('returns the next function if user has role that is passed in as parameter', function() {

                fn = authMdl.authorize();
                reqStub.user.hasRole.returns(true);
                var nextRetVal = Math.random();
                nextStub.returns(nextRetVal);
                var ret = fn(reqStub, resStub, nextStub);
                sinon.assert.calledOnce(nextStub);
                should.exist(ret);
                ret.should.equal(nextRetVal);

            });

            it('returns unauthorized if no user', function() {

                fn = authMdl.authorize();
                reqStub.user = null;
                fn(reqStub, resStub, nextStub);

                sinon.assert.calledWithExactly(resStub.status, 403);
                sinon.assert.calledOnce(resStub.end);
            });

            it('returns unauthorized if role does not match', function() {

                fn = authMdl.authorize();
                reqStub.user.hasRole.returns(false);
                fn(reqStub, resStub, nextStub);

                sinon.assert.calledWithExactly(resStub.status, 403);
                sinon.assert.calledOnce(resStub.end);
            });

        });


        afterEach(function() {
            sandbox.restore();
        });

});