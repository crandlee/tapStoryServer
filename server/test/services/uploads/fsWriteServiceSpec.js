"use strict";
var cb = require('common-bundle')({test:true});
var should = cb.should;
var sinon = cb.sinon;
var testUtils = cb.testUtils;
var promiseUtils = cb.promiseUtils;

describe('services/uploads/fsWriteServiceSpec.js', function () {

    var sandbox;
    var writeSvc;

    beforeEach(function () {

        sandbox = sinon.sandbox.create();
        var fs = sandbox.stub({
            writeFile: function(file, data, cb) {}
        });
        cb.errSvc.bypassLogger(true);

        writeSvc = cb.proxyquire(cb.getRoutePathFromKey('svc-write'),
            { fs: fs });

    });

    describe('writeFile', function() {


        it('calls finalizeFile with destPath & data when no optional dir', function(done) {
            var opts = { finalizeFile: promiseUtils.getNoopPromiseStub() };
            var destFile = testUtils.getRandomString(10);
            var data = testUtils.getRandomString(25);
            writeSvc.writeFile(destFile, data, opts)
                .then(function(ret) {
                    ret.args[0].should.equal(cb.config.uploadPath + destFile);
                    ret.args[1].should.equal(data);
                })
                .fail(function(err) {
                    throw err;
                })
                .fin(done)
                .done();

        });

        it('calls mkdirp with optionalPath added when optional dir exists', function(done) {

            var opts = { dirName: testUtils.getRandomString(10),
                finalizeFile: function() { return arguments; } };
            var destFile = testUtils.getRandomString(10);
            var data = testUtils.getRandomString(25);
            var testMkdirpCall = testUtils.getRandomString(10);
            writeSvc._setMkdirp(promiseUtils.getResolvingPromiseStub(testMkdirpCall));

            writeSvc.writeFile(destFile, data, opts)
                .then(function(ret) {
                    ret[2].returned.should.equal(testMkdirpCall);
                })
                .fail(function(err) {
                    throw err;
                })
                .fin(done)
                .done();

        });

        it('rejects when mkdirp throws error', function(done) {

            var opts = { dirName: testUtils.getRandomString(10),
                finalizeFile: promiseUtils.getNoopPromiseStub() };
            var testError = testUtils.getRandomString(10);
            var destFile = testUtils.getRandomString(10);
            var data = testUtils.getRandomString(25);
            writeSvc._setMkdirp(promiseUtils.getRejectExactlyPromiseStub(testError));

            writeSvc.writeFile(destFile, data, opts)
                .then(function() {
                    throw new Error('Resolved instead of rejecting');
                })
                .fail(function(err) {
                    err.message.should.contain(testError);
                })
                .fin(done)
                .done();

        });

        it('calls finalizeFile with optional dir and data when mkdirp succeeds', function(done) {

            var opts = { dirName: testUtils.getRandomString(10),
                finalizeFile: promiseUtils.getNoopPromiseStub() };
            var destFile = testUtils.getRandomString(10);
            var data = testUtils.getRandomString(25);
            writeSvc._setMkdirp(promiseUtils.getNoopPromiseStub());

            writeSvc.writeFile(destFile, data, opts)
                .then(function(ret) {
                    ret.args[0].should.equal(cb.config.uploadPath + opts.dirName + '/' + destFile);
                    ret.args[1].should.equal(data);
                })
                .fail(function(err) {
                    throw err;
                })
                .fin(done)
                .done();

        });

        it('calls fs.WriteFile from finalizeFile', function(done) {

            var opts = { dirName: testUtils.getRandomString(10) };
            var destFile = testUtils.getRandomString(10);
            var data = testUtils.getRandomString(25);
            writeSvc._setMkdirp(promiseUtils.getNoopPromiseStub());
            writeSvc._setFs({
                writeFile: promiseUtils.getNoopPromiseStub()
            });

            writeSvc.writeFile(destFile, data, opts)
                .then(function(ret) {
                    ret.args[0].should.equal(cb.config.uploadPath + opts.dirName + '/' + destFile);
                    ret.args[1].should.equal(data);
                })
                .fail(function(err) {
                    throw err;
                })
                .fin(done)
                .done();

        });

        it('Rejects when fs.WriteFile has error', function(done) {

            var opts = { dirName: testUtils.getRandomString(10) };
            var destFile = testUtils.getRandomString(10);
            var data = testUtils.getRandomString(25);
            var testError = testUtils.getRandomString(10);
            writeSvc._setMkdirp(promiseUtils.getNoopPromiseStub());
            writeSvc._setFs({
                writeFile: promiseUtils.getRejectExactlyPromiseStub(testError)
            });

            writeSvc.writeFile(destFile, data, opts)
                .then(function() {
                    throw new Error('Resolves when should have rejected');
                })
                .fail(function(err) {
                    err.message.should.contain(testError);
                })
                .fin(done)
                .done();

        });

        it('fs.WriteFile resolves the created file name when no error', function(done) {

            var opts = { dirName: testUtils.getRandomString(10) };
            var destFile = testUtils.getRandomString(10);
            var data = testUtils.getRandomString(25);
            var testResolveVal = testUtils.getRandomString(10);
            writeSvc._setMkdirp(promiseUtils.getNoopPromiseStub());
            writeSvc._setFs({
                writeFile: promiseUtils.getResolveExactlyPromiseStub(testResolveVal)
            });

            writeSvc.writeFile(destFile, data, opts)
                .then(function(ret) {
                    ret.should.equal(testResolveVal);
                })
                .fail(function(err) {
                    throw err;
                })
                .fin(done)
                .done();

        });

    });

    afterEach(function() {
        sandbox.restore();
    });

});