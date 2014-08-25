"use strict";
require('require-enhanced')();

var should = require('chai').should();
var proxyquire = require('proxyquire');

describe("config/config.js", function () {
    it("creates both the development and server object", function () {
        var config = proxyquire(global.getRoutePathFromKey('cfg-config'), {  });
        should.exist(config.development);
        should.exist(config.production);
    });
});