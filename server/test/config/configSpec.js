var should = require('chai').should();
var proxyquire = require('proxyquire');

describe("Config", function() {
    describe("config.js", function() {
        it("creates both the development and server object", function() {
           var pathStub = {
               normalize: function() {
                   return '/dummyPath';
               }
           };
           var config = proxyquire('../../config/config', { 'path': pathStub });
           should.exist(config.development);
           should.exist(config.production);
           config.production.rootPath.should.equal('/dummyPath');
        });
    });
});