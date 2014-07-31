var sinon = require('sinon');
var proxyquire = require('proxyquire');
var should = require('chai').should();

describe('controllers', function() {
    describe('authCtrl.js', function() {

        var authSvcStub, authCtrl, resStub, reqStub, nextStub;
        var sandbox;

        beforeEach(function() {

            sandbox = sinon.sandbox.create();
            authSvcStub = sandbox.stub(require('../../../services/authentication/passportService'));
            authCtrl = proxyquire('../../../controllers/authentication/authCtrl', { authSvc: authSvcStub });
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
                var ret = authCtrl.authenticateMethod(reqStub, resStub, nextStub);
                sinon.assert.calledOnce(authSvcStub.authenticateMethod);
                ret.should.equal(testData);

            });

        });


        describe('authorizeMethod', function() {

            var fn = null;

            it('returns a function', function() {
                fn = authCtrl.authorizeMethod();
                should.exist(fn);
                fn.should.be.a('function');
            });

            it('passes a role to the hasRole method', function() {

                var testRole = 'arbitraryRole';
                fn = authCtrl.authorizeMethod(testRole);
                fn(reqStub, resStub, nextStub);
                sinon.assert.calledWith(reqStub.user.hasRole, testRole);

            });

            it('returns the next function if user has role that is passed in as parameter', function() {

                fn = authCtrl.authorizeMethod();
                reqStub.user.hasRole.returns(true);
                var nextRetVal = Math.random();
                nextStub.returns(nextRetVal);
                var ret = fn(reqStub, resStub, nextStub);
                sinon.assert.calledOnce(nextStub);
                should.exist(ret);
                ret.should.equal(nextRetVal);

            });

            it('returns unauthorized if no user', function() {

                fn = authCtrl.authorizeMethod();
                reqStub.user = null;
                fn(reqStub, resStub, nextStub);

                sinon.assert.calledWithExactly(resStub.status, 403);
                sinon.assert.calledOnce(resStub.end);
            });

            it('returns unauthorized if role does not match', function() {

                fn = authCtrl.authorizeMethod();
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
});