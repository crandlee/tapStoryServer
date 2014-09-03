"use strict";
require('require-enhanced')({ test: true });

describe('services/authentication/userService', function () {

    var sinon = global.sinon, sandbox;
    var userSvc, resourceSvcStub, userSvcOptions;

    beforeEach(function () {

        global.errSvc.bypassLogger(true);
        sandbox = sinon.sandbox.create();
        resourceSvcStub = sandbox.stub(global.rootRequire('svc-resource'));
        userSvcOptions = global.rootRequire('svc-opts-user');
        userSvc = global.proxyquire(global.getRoutePathFromKey('svc-user'),
            { resourceSvc: resourceSvcStub });

    });


    describe('save', function() {
        it('calls processDocumentSave on the resource service with the proper parameters', function(done) {

            var updateProperties = { testMe: global.testUtils.getRandomString(10) };
            var options = { myOption: global.testUtils.getRandomString(10) };
            userSvc.save(updateProperties, options);
            sinon.assert.calledWithExactly(resourceSvcStub.processDocumentSave, null,
                userSvcOptions.setSaveUserOptions, global.extend(options, updateProperties) );
            done();

        });
    });

    describe('addRole', function() {
        it('calls processDocumentSave on the resource service with the proper parameters', function(done) {

            var userName = global.testUtils.getRandomString(10);
            var newRole = global.testUtils.getRandomString(10);
            var opts = { opt1: global.testUtils.getRandomString(10) };
            userSvc.addRole(userName, newRole, opts);
            sinon.assert.calledWithExactly(resourceSvcStub.processDocumentSave,
                { userName: userName, role: newRole }, userSvcOptions.setAddRoleOptions, opts);
            done();

        });

    });

    describe('removeRole', function() {
        it('calls processDocumentSave on the resource service with the proper parameters', function(done) {

            var userName = global.testUtils.getRandomString(10);
            var existRole = global.testUtils.getRandomString(10);
            var opts = { opt1: global.testUtils.getRandomString(10) };
            userSvc.removeRole(userName, existRole, opts);
            sinon.assert.calledWithExactly(resourceSvcStub.processDocumentSave,
                { userName: userName, role: existRole }, userSvcOptions.setRemoveRoleOptions, opts);
            done();

        });

    });

    describe('addFile', function() {
        it('calls processDocumentSave on the resource service with the proper parameters', function(done) {

            var userName = global.testUtils.getRandomString(10);
            var fileName = global.testUtils.getRandomString(10);
            var groupId = global.testUtils.getRandomString(10);
            var opts = { opt1: global.testUtils.getRandomString(10) };
            userSvc.addFile(userName, fileName, groupId, opts);
            sinon.assert.calledWithExactly(resourceSvcStub.processDocumentSave,
                { userName: userName, file: fileName, groupId: groupId },
                userSvcOptions.setAddFileOptions, opts);
            done();
        });

    });

    describe('removeFile', function() {
        it('calls processDocumentSave on the resource service with the proper parameters', function(done) {

            var userName = global.testUtils.getRandomString(10);
            var fileName = global.testUtils.getRandomString(10);
            var groupId = global.testUtils.getRandomString(10);
            var opts = { opt1: global.testUtils.getRandomString(10) };
            userSvc.removeFile(userName, fileName, groupId, opts);
            sinon.assert.calledWithExactly(resourceSvcStub.processDocumentSave,
                { userName: userName, file: fileName, groupId: groupId },
                userSvcOptions.setRemoveFileOptions, opts);
            done();

        });

    });

    describe('getList', function() {

        it('calls getList on the resource service with the proper parameters', function(done) {

            var query = global.testUtils.getRandomString(10);
            var opts = { opt1: global.testUtils.getRandomString(10) };
            userSvc.getList(query, opts);
            sinon.assert.calledWithExactly(resourceSvcStub.getList,
                global.extend(opts, { modelName: 'User', query: query }));
            done();

        });

    });

    describe('getSingle', function() {
        it('calls getSingle on the resource service with the proper parameters', function(done) {

            var query = global.testUtils.getRandomString(10);
            var opts = { opt1: global.testUtils.getRandomString(10) };
            userSvc.getSingle(query, opts);
            sinon.assert.calledWithExactly(resourceSvcStub.getSingle,
                global.extend(opts, { modelName: 'User', query: query }));
            done();

        });

    });

    afterEach(function () {
        sandbox.restore();
    });

});