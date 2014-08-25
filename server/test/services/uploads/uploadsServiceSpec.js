"use strict";
require('require-enhanced')({ test: true });
var uuid = require('node-uuid');

describe('services/uploads/uploadServiceSpec.js', function () {

    var sinon = global.sinon, sandbox;
    var uploadSvc, reqFiles;
    var groupId = uuid.v4();

    beforeEach(function () {

        sandbox = sinon.sandbox.create();
        var fs = {
            readFile: function(filePath) {}
        };
        var writeSvc = { writeFile: function() {}};
        var userSvc = { addFile: function() {}};
        global.errSvc.bypassLogger(true);

        uploadSvc = global.proxyquire(global.getRoutePathFromKey('svc-uploads'),
            { fs: fs, writeSvc: writeSvc, userSvc: userSvc });

        reqFiles = {
            field1: { name: global.testUtils.getRandomString(10), path: global.testUtils.getRandomString(10)},
            field2: { name: global.testUtils.getRandomString(10), path: global.testUtils.getRandomString(10)}
        };

    });

    describe('uploadFiles', function() {

        it('executes processFiles for each file sent in', function(done) {
//            uploadSvc._setFs({
//               readFile: global.promiseUtils.getNoopPromiseStub()
//            });
            var opts = { processFile: global.promiseUtils.getNoopPromiseStub(), groupId: groupId };
            uploadSvc.uploadFiles(reqFiles, opts)
                .then(function(ret) {
                    //Note there is currently a problem with the promise stubs
                    //where only the first value in multiple calls to a promise is available
                    //it is not remembering the second. So test should only check second element
                    //for now
                    ret.length.should.equal(2);
                    ret[1].args[0].should.equal(reqFiles.field1.path);
                    ret[1].args[1].should.equal(reqFiles.field1.name);
                    ret[1].args[2].should.equal(groupId);
                })
                .fail(function(err){
                    throw err;
                })
                .fin(done)
                .done();

        });
        it('rejects if any file name is empty', function(done) {

            var opts = { groupId: groupId };
            reqFiles.field1.name = null;
            uploadSvc.uploadFiles(reqFiles, opts)
                .then(function() {
                    throw new Error('Resolved instead of rejecting');
                })
                .fail(function(err){
                    err.message.should.contain("Upload requires a valid file path and name");
                })
                .fin(done)
                .done();

        });

        it('rejects if any file path is empty', function(done) {
            var opts = { groupId: groupId };
            reqFiles.field1.path = null;
            uploadSvc.uploadFiles(reqFiles, opts)
                .then(function() {
                    throw new Error('Resolved instead of rejecting');
                })
                .fail(function(err){
                    err.message.should.contain("Upload requires a valid file path and name");
                })
                .fin(done)
                .done();

        });

        it('rejects if fs.readFile throws an error', function(done) {
            var testError = global.testUtils.getRandomString(10);
            uploadSvc._setFs({
               readFile: global.promiseUtils.getRejectExactlyPromiseStub(testError)
            });
            var opts = { groupId: groupId };
            uploadSvc.uploadFiles(reqFiles, opts)
                .then(function() {
                    throw new Error('Resolves when it should reject');
                })
                .fail(function(err){
                    err.message.should.contain(testError);
                    err.message.should.contain("Could not complete file upload process");
                })
                .fin(done)
                .done();

        });

        it('calls fileOutputComplete if fs.readFile does not throw error', function(done) {

            var testResolveString = global.testUtils.getRandomString(10);
            uploadSvc._setFs({
                readFile: global.promiseUtils.getResolveExactlyPromiseStub(testResolveString)
            });
            var opts = { groupId: groupId, fileOutputComplete: global.promiseUtils.getNoopPromiseStub() };
            uploadSvc.uploadFiles(reqFiles, opts)
                .then(function(ret) {
                    ret[0].args[0].should.equal(reqFiles.field1.path);
                    ret[0].args[1].should.equal(reqFiles.field1.name);
                    ret[0].args[2].should.equal(groupId);
                    ret[0].args[3].should.equal(testResolveString);
                })
                .fail(function(err){
                    throw err;
                })
                .fin(done)
                .done();

        });

        it('calls writeFile on the writeService', function(done) {

            var testDataString = global.testUtils.getRandomString(10);
            var testRetFromWriteFile = global.testUtils.getRandomString(10);
            uploadSvc._setFs({readFile: global.promiseUtils.getResolveExactlyPromiseStub(testDataString)});
            uploadSvc._setWriteService({writeFile: global.promiseUtils.getResolveExactlyPromiseStub(testRetFromWriteFile)});
            uploadSvc._setUserService({addFile: global.promiseUtils.getNoopPromiseStub()});

            var opts = { groupId: groupId };
            uploadSvc.uploadFiles(reqFiles, opts)
                .then(function(ret) {
                    ret[0].args[4].should.equal(testRetFromWriteFile);
                })
                .fail(function(err){
                    throw err;
                })
                .fin(done)
                .done();

        });

        it('rejects if writeService.writeFile throws an error', function(done) {
            var testDataString = global.testUtils.getRandomString(10);
            var testErrFromWriteFile = global.testUtils.getRandomString(10);
            uploadSvc._setFs({readFile: global.promiseUtils.getResolveExactlyPromiseStub(testDataString)});
            uploadSvc._setWriteService({writeFile: global.promiseUtils.getRejectExactlyPromiseStub(testErrFromWriteFile)});
            uploadSvc._setUserService({addFile: global.promiseUtils.getNoopPromiseStub()});

            var opts = { groupId: groupId };
            uploadSvc.uploadFiles(reqFiles, opts)
                .then(function() {
                    throw new Error('Resolved instead of rejecting');
                })
                .fail(function(err){
                    err.message.should.contain(testErrFromWriteFile);
                })
                .fin(done)
                .done();

        });

        it('rejects if userService.addFile throws an error', function(done) {

            var testDataString = global.testUtils.getRandomString(10);
            var testRetFromWriteFile = global.testUtils.getRandomString(10);
            var testErrorString = global.testUtils.getRandomString(10);
            uploadSvc._setFs({readFile: global.promiseUtils.getResolveExactlyPromiseStub(testDataString)});
            uploadSvc._setWriteService({writeFile: global.promiseUtils.getResolveExactlyPromiseStub(testRetFromWriteFile)});
            uploadSvc._setUserService({addFile: global.promiseUtils.getRejectExactlyPromiseStub(testErrorString)});

            var opts = { groupId: groupId };
            uploadSvc.uploadFiles(reqFiles, opts)
                .then(function() {
                    throw new Error('Resolved instead of rejecting');
                })
                .fail(function(err){
                    err.message.should.contain(testErrorString);
                })
                .fin(done)
                .done();

        });


    });

    afterEach(function() {
       sandbox.restore();
    });

});