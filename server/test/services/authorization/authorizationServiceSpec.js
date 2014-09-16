"use strict";
var cb = require('common-bundle')({test:true});
var should = cb.should;
var sinon = cb.sinon;
var testUtils = cb.testUtils;

describe('services/authorization/authorizationService.js', function () {

    var sandbox;
    var authSvc;

    beforeEach(function () {

        sandbox = sinon.sandbox.create();
        authSvc = cb.proxyquire(cb.getRoutePathFromKey('svc-auth'),
            {  });

    });


    describe('isValidRole', function () {
        it('returns true when valid role is given', function () {
            authSvc.isValidRole("admin").should.equal(true);

        });
        it('returns false when invalid role is given', function () {
            var randomRole = testUtils.getRandomString(32);
            authSvc.isValidRole(randomRole).should.equal(false);
        });
    });

    afterEach(function () {
        sandbox.restore();
    });

});