"use strict";
require('require-enhanced')({ test: true });


describe('controllers/authentication/uploadsCtrlSpec.js', function() {

    var sinon = global.sinon, sandbox;
    var uploadsCtrl, uploadsSvcStub, resStub, reqStub, nextStub;

    beforeEach(function() {

        sandbox = sinon.sandbox.create();

        uploadsSvcStub = sandbox.stub(global.rootRequire('svc-uploads'));

        uploadsCtrl = global.proxyquire(global.getRoutePathFromKey('ctrl-uploads'), {});

        resStub  = sandbox.stub({
            status: function() {},
            send: function() {},
            end: function() {}
        });
        reqStub = sandbox.stub({
            user: sandbox.stub({
                hasRole: function() {}
            }),
            files: []
        });
        nextStub = sandbox.stub();

    });

    describe('uploads', function() {

        it('fails with 400 when userName is not on the parameters', function() {

            uploadsSvcStub.uploadFiles = global.promiseUtils.getNoopPromiseStub();
            uploadsCtrl._setUploadsService(uploadsSvcStub);

            reqStub.params = { userName: null };
            uploadsCtrl.upload(reqStub, resStub, nextStub);
            sinon.assert.calledWithExactly(resStub.status, 400);
            sinon.assert.calledOnce(resStub.end);
            sinon.assert.calledOnce(nextStub);
        });

        it('calls uploadFiles on the uploads service with the proper options and returns 200 ok after', function(done) {

            var userName = global.testUtils.getRandomString(10);
            var fileName = global.testUtils.getRandomString(10);
            uploadsSvcStub.uploadFiles = global.promiseUtils.getNoopPromiseStub();
            uploadsCtrl._setUploadsService(uploadsSvcStub);
            reqStub.files = [fileName];
            reqStub.params = { userName: userName };
            uploadsCtrl.upload(reqStub, resStub, nextStub);
            uploadsSvcStub.uploadFiles()
                .then(function(ret) {
                    ret.args[0][0].should.equal(fileName);
                    ret.args[1].userName.should.equal(userName);
                    sinon.assert.calledWithExactly(resStub.status, 200);
                    sinon.assert.calledOnce(resStub.end);
                })
                .fail(function(err) {
                    throw err;
                })
                .fin(done)
                .done(function() {
                    sinon.assert.calledOnce(nextStub);
                });
        });

        it('sends 500 and an error when upload service uploadFiles fails', function(done) {

            var testError = global.testUtils.getRandomString(10);
            uploadsSvcStub.uploadFiles = global.promiseUtils.getRejectExactlyPromiseStub(testError);
            uploadsCtrl._setUploadsService(uploadsSvcStub);
            reqStub.params = { userName: 'anything' };
            uploadsCtrl.upload(reqStub, resStub, nextStub);
            uploadsSvcStub.uploadFiles()
                .then(function() {
                    throw new Error('Resolved when it should have rejected');
                })
                .fail(function(err) {
                    sinon.assert.calledWithExactly(resStub.status, 500);
                    err.message.should.contain(testError);
                })
                .fin(done)
                .done(function() {
                    sinon.assert.calledOnce(nextStub);
                });
        });
    });

    describe('getUploadScreen', function() {
        it('fails with 400 when userName is not on the parameters', function() {
            reqStub.params = { userName: null };
            uploadsCtrl.getUploadsScreen(reqStub, resStub, nextStub);
            sinon.assert.calledWithExactly(resStub.status, 400);
            sinon.assert.calledOnce(resStub.end);
            sinon.assert.calledOnce(nextStub);
        });

        it('sends the uploads html to the requestor', function() {
            var userName = global.testUtils.getRandomString(10);
            var uri = global.config.baseUri;
            reqStub.params = { userName: userName };
            var uploadsHtml = '<html>' + userName + uri + '</html>';
            uploadsCtrl.getUploadsHtml =
                function(userName, uri) { return '<html>' + userName + uri + '</html>'; };

            uploadsCtrl.getUploadsScreen(reqStub, resStub, nextStub);
            sinon.assert.calledWithExactly(resStub.end, uploadsHtml);
            sinon.assert.calledOnce(nextStub);
        });
    });

    afterEach(function() {
        sandbox.restore();
    });

});
