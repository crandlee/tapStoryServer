var sinon = require('sinon');
var should = require('chai').should();
var proxyquire = require('proxyquire');
var utils = require('../../utilities/testUtilities');

describe('services', function () {
    describe('authorization', function () {

        var sandbox;
        var authSvc;

        beforeEach(function() {

            sandbox = sinon.sandbox.create();
            authSvc = proxyquire('../../../services/authorization/authorizationService',
                {  });

        });

        describe('authorizationService.js', function () {

            describe('isValidRole', function() {
                it('returns true when valid role is given', function() {
                    authSvc.isValidRole("admin").should.equal(true);

                });
                it('returns false when invalid role is given', function() {
                   var randomRole = utils.getRandomString(32);
                   authSvc.isValidRole(randomRole).should.equal(false);
                });
            });
        });

        afterEach(function() {
            sandbox.restore();
        });

    });
});