"use strict";
var cb = require('common-bundle')( { test: true });
var should = cb.should;
var sinon = cb.sinon;

describe("config/config.js", function () {
    it("creates both the development and server object", function () {
        var config = cb.proxyquire(cb.getRoutePathFromKey('cfg-config'), {  });
        should.exist(config.development);
        should.exist(config.production);
    });
});