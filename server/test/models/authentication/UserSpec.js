"use strict";
require('require-enhanced')();

var sinon = require('sinon');
var mongoose = require('mongoose');
var utils = global.rootRequire('util-test');
var should = require('chai').should();
var proxyquire = require('proxyquire');


describe('models', function () {

    var sandbox, encUtility, authorizeSvc;
    var User, testRole, testUser;

    before(function() {

        sandbox = sinon.sandbox.create();
        encUtility = sandbox.stub(global.rootRequire('util-encryption'));
        authorizeSvc = sandbox.stub(global.rootRequire('svc-auth'));

        proxyquire(global.getRoutePathFromKey('model-User'),
        { encryptionUtility: encUtility, authorizeSvc: authorizeSvc });

        User = mongoose.model('User');
        testRole = utils.getRandomString(10);
        testUser = new User(
            { firstName: utils.getRandomString(10),
                lastName: utils.getRandomString(10),
                userName: utils.getRandomString(10),
                userSecret: utils.getRandomString(16),
                roles: [testRole]});

    });



    describe('authentication', function () {

        describe('User.js', function () {



            //Model instance methods
            describe('authenticate', function () {

                it('returns what is passed into the encrpytion utility', function () {

                    var passwordToMatch = utils.getRandomString(16);
                    var utilReturns = true;
                    encUtility.checkEqualToken.returns(utilReturns);
                    var ret = testUser.authenticate(passwordToMatch);

                    sinon.assert.calledWithExactly(encUtility.checkEqualToken, passwordToMatch, testUser.userSecret);
                    should.exist(ret);
                    ret.should.equal(utilReturns);

                });


            });

            describe('hasRole', function() {

                it('returns true when the role exists on the user', function() {

                    authorizeSvc.isValidRole.returns(true);
                    testUser.hasRole(testRole).should.equal(true);

                });

                it('returns false when the role does not exist on the user', function() {

                    authorizeSvc.isValidRole.returns(true);
                    testUser.hasRole('dummyRole').should.equal(false);

                });

            });

            describe('viewModel', function() {

                it('returns an object when called with "user"', function() {

                    should.exist(testUser.viewModel('user'));

                });

                it('returns an object when called with "users"', function() {

                    should.exist(testUser.viewModel('users'));

                });

                it('returns an object when called with no param', function() {

                    should.exist(testUser.viewModel());

                });

            });


        });
    });

    after(function() {
       sandbox.restore();
    });
});