"use strict";
require('require-enhanced')({ test: true });

describe('services/authorization/authorizationService.js', function () {

    var sinon = global.sinon, sandbox;
    var authSvc;

    beforeEach(function () {

        sandbox = sinon.sandbox.create();
        authSvc = global.proxyquire(global.getRoutePathFromKey('svc-auth'),
            {  });

    });


    describe('isValidRole', function () {
        it('returns true when valid role is given', function () {
            authSvc.isValidRole("admin").should.equal(true);

        });
        it('returns false when invalid role is given', function () {
            var randomRole = global.testUtils.getRandomString(32);
            authSvc.isValidRole(randomRole).should.equal(false);
        });
    });

    afterEach(function () {
        sandbox.restore();
    });

});