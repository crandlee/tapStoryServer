"use strict";
require('require-enhanced')({ test: true });

describe('services/uploads/fsWriteServiceSpec.js', function () {

    var sinon = global.sinon, sandbox;
    var writeSvc;

    beforeEach(function () {

        sandbox = sinon.sandbox.create();
        var fs = sandbox.stub({
            writeFile: function(file, data, cb) {}
        });
        global.errSvc.bypassLogger(true);

        writeSvc = global.proxyquire(global.getRoutePathFromKey('svc-write'),
            { fs: fs });

    });

    describe('writeFile', function() {


        it('calls finalizeFile with destPath & data when no optional dir', function(done) {
            var opts = { finalizeFile: global.promiseUtils.getNoopPromiseStub() };
            var destFile = global.testUtils.getRandomString(10);
            var data = global.testUtils.getRandomString(25);
            writeSvc.writeFile(destFile, data, opts)
                .then(function(ret) {
                    ret.args[0].should.equal(global.config.uploadPath + destFile);
                    ret.args[1].should.equal(data);
                })
                .fail(function(err) {
                    throw err;
                })
                .fin(done)
                .done();

        });

        it('calls mkdirp with optionalPath added when optional dir exists', function(done) {

            var opts = { dirName: global.testUtils.getRandomString(10),
                finalizeFile: function() { return arguments; } };
            var destFile = global.testUtils.getRandomString(10);
            var data = global.testUtils.getRandomString(25);
            var testMkdirpCall = global.testUtils.getRandomString(10);
            writeSvc._setMkdirp(global.promiseUtils.getResolvingPromiseStub(testMkdirpCall));

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

            var opts = { dirName: global.testUtils.getRandomString(10),
                finalizeFile: global.promiseUtils.getNoopPromiseStub() };
            var testError = global.testUtils.getRandomString(10);
            var destFile = global.testUtils.getRandomString(10);
            var data = global.testUtils.getRandomString(25);
            writeSvc._setMkdirp(global.promiseUtils.getRejectExactlyPromiseStub(testError));

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

            var opts = { dirName: global.testUtils.getRandomString(10),
                finalizeFile: global.promiseUtils.getNoopPromiseStub() };
            var destFile = global.testUtils.getRandomString(10);
            var data = global.testUtils.getRandomString(25);
            writeSvc._setMkdirp(global.promiseUtils.getNoopPromiseStub());

            writeSvc.writeFile(destFile, data, opts)
                .then(function(ret) {
                    ret.args[0].should.equal(global.config.uploadPath + opts.dirName + '/' + destFile);
                    ret.args[1].should.equal(data);
                })
                .fail(function(err) {
                    throw err;
                })
                .fin(done)
                .done();

        });

        it('calls fs.WriteFile from finalizeFile', function(done) {

            var opts = { dirName: global.testUtils.getRandomString(10) };
            var destFile = global.testUtils.getRandomString(10);
            var data = global.testUtils.getRandomString(25);
            writeSvc._setMkdirp(global.promiseUtils.getNoopPromiseStub());
            writeSvc._setFs({
                writeFile: global.promiseUtils.getNoopPromiseStub()
            });

            writeSvc.writeFile(destFile, data, opts)
                .then(function(ret) {
                    ret.args[0].should.equal(global.config.uploadPath + opts.dirName + '/' + destFile);
                    ret.args[1].should.equal(data);
                })
                .fail(function(err) {
                    throw err;
                })
                .fin(done)
                .done();

        });

        it('Rejects when fs.WriteFile has error', function(done) {

            var opts = { dirName: global.testUtils.getRandomString(10) };
            var destFile = global.testUtils.getRandomString(10);
            var data = global.testUtils.getRandomString(25);
            var testError = global.testUtils.getRandomString(10);
            writeSvc._setMkdirp(global.promiseUtils.getNoopPromiseStub());
            writeSvc._setFs({
                writeFile: global.promiseUtils.getRejectExactlyPromiseStub(testError)
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

            var opts = { dirName: global.testUtils.getRandomString(10) };
            var destFile = global.testUtils.getRandomString(10);
            var data = global.testUtils.getRandomString(25);
            var testResolveVal = global.testUtils.getRandomString(10);
            writeSvc._setMkdirp(global.promiseUtils.getNoopPromiseStub());
            writeSvc._setFs({
                writeFile: global.promiseUtils.getResolveExactlyPromiseStub(testResolveVal)
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