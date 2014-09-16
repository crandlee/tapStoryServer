"use strict";
var cb = require('common-bundle')({test:true});
var should = cb.should;
var sinon = cb.sinon;
var testUtils = cb.testUtils;

describe('services/authentication/userService', function () {

    var sandbox;
    var userSvc, resourceSvcStub, userSvcOptions;

    beforeEach(function () {

        cb.errSvc.bypassLogger(true);
        sandbox = sinon.sandbox.create();
        resourceSvcStub = sandbox.stub(cb.rootRequire('svc-resource'));
        userSvcOptions = cb.rootRequire('svc-opts-user');
        userSvc = cb.proxyquire(cb.getRoutePathFromKey('svc-user'),
            { resourceSvc: resourceSvcStub });

    });


    describe('save', function() {
        it('calls processDocumentSave on the resource service with the proper parameters', function(done) {

            var updateProperties = { testMe: testUtils.getRandomString(10) };
            var options = { myOption: testUtils.getRandomString(10) };
            userSvc.save(updateProperties, options);
            sinon.assert.calledWithExactly(resourceSvcStub.processDocumentSave, null,
                userSvcOptions.setSaveUserOptions, cb.extend(options, updateProperties) );
            done();

        });
    });

    describe('addRole', function() {
        it('calls processDocumentSave on the resource service with the proper parameters', function(done) {

            var userName = testUtils.getRandomString(10);
            var newRole = testUtils.getRandomString(10);
            var opts = { opt1: testUtils.getRandomString(10) };
            userSvc.addRole(userName, newRole, opts);
            sinon.assert.calledWithExactly(resourceSvcStub.processDocumentSave,
                { userName: userName, role: newRole }, userSvcOptions.setAddRoleOptions, opts);
            done();

        });

    });

    describe('removeRole', function() {
        it('calls processDocumentSave on the resource service with the proper parameters', function(done) {

            var userName = testUtils.getRandomString(10);
            var existRole = testUtils.getRandomString(10);
            var opts = { opt1: testUtils.getRandomString(10) };
            userSvc.removeRole(userName, existRole, opts);
            sinon.assert.calledWithExactly(resourceSvcStub.processDocumentSave,
                { userName: userName, role: existRole }, userSvcOptions.setRemoveRoleOptions, opts);
            done();

        });

    });

    describe('addFile', function() {
        it('calls processDocumentSave on the resource service with the proper parameters', function(done) {

            var userName = testUtils.getRandomString(10);
            var fileName = testUtils.getRandomString(10);
            var groupId = testUtils.getRandomString(10);
            var opts = { opt1: testUtils.getRandomString(10) };
            userSvc.addFile(userName, fileName, groupId, opts);
            sinon.assert.calledWithExactly(resourceSvcStub.processDocumentSave,
                { userName: userName, file: fileName, groupId: groupId },
                userSvcOptions.setAddFileOptions, opts);
            done();
        });

    });

    describe('removeFile', function() {
        it('calls processDocumentSave on the resource service with the proper parameters', function(done) {

            var userName = testUtils.getRandomString(10);
            var fileName = testUtils.getRandomString(10);
            var groupId = testUtils.getRandomString(10);
            var opts = { opt1: testUtils.getRandomString(10) };
            userSvc.removeFile(userName, fileName, groupId, opts);
            sinon.assert.calledWithExactly(resourceSvcStub.processDocumentSave,
                { userName: userName, file: fileName, groupId: groupId },
                userSvcOptions.setRemoveFileOptions, opts);
            done();

        });

    });

    describe('getList', function() {

        it('calls getList on the resource service with the proper parameters', function(done) {

            var query = testUtils.getRandomString(10);
            var opts = { opt1: testUtils.getRandomString(10) };
            userSvc.getList(query, opts);
            sinon.assert.calledWithExactly(resourceSvcStub.getList,
                cb.extend(opts, { modelName: 'User', query: query }));
            done();

        });

    });

    describe('getSingle', function() {
        it('calls getSingle on the resource service with the proper parameters', function(done) {

            var query = testUtils.getRandomString(10);
            var opts = { opt1: testUtils.getRandomString(10) };
            userSvc.getSingle(query, opts);
            sinon.assert.calledWithExactly(resourceSvcStub.getSingle,
                cb.extend(opts, { modelName: 'User', query: query }));
            done();

        });

    });

    afterEach(function () {
        sandbox.restore();
    });

});