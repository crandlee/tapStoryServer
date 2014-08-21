"use strict";
require('require-enhanced')();

var sinon = require('sinon');
var should = require('chai').should();

//RL - This module has become trivialized as most of its functionality has been moved to the
//resource service now.

//TODO-Randy: Rethink some unit tests for the new functionality in the resource service and the user service options

//var proxyquire = require('proxyquire');
//var utils = global.rootRequire('util-test');

//describe('services', function () {
//    describe('authentication', function () {
//
//        var sandbox;
//        var userSvc;
//        var errSvc;
//        var resourceSvc;
//        var encryptionSvc;
//        var authorizeSvc;
//        var promiseSvc;
//
//        describe('userService.js', function () {
//
//            beforeEach(function() {
//
//                sandbox = sinon.sandbox.create();
//                errSvc = sandbox.stub(global.rootRequire('svc-error'));
//                resourceSvc = sandbox.stub(global.rootRequire('svc-resource'));
//                encryptionSvc = sandbox.stub(global.rootRequire('util-encryption'));
//                authorizeSvc = sandbox.stub(global.rootRequire('svc-auth'));
//                promiseSvc = sandbox.stub(global.rootRequire('svc-promise'));
//                userSvc = proxyquire(global.getRoutePathFromKey('svc-user'),
//                    { resourceSvc: resourceSvc,
//                        encryptionSvc: encryptionSvc, authorizeSvc: authorizeSvc, promiseSvc: promiseSvc, errSvc: errSvc });
//
//            });
//
//            describe('save', function() {
//
////                it.only('properly builds the options object', function() {
////                    var optionsStub = sandbox.stub({});
////                    var userName = utils.getRandomString(10);
////                    userSvc.save({ userName: userName }, optionsStub);
////                    optionsStub.userName = userName;
////                    should.exist(optionsStub.preValidation);
////                    optionsStub.onNew.roles.should.equal('user');
////                    optionsStub.modelName.should.equal('User');
////                    optionsStub.singleSearch.userName.should.equal(userName);
////                    should.exist(optionsStub.mapPropertiesToResource);
////                });
//
//                it('calls process on the resource service', function() {
//                    var optionsStub = sandbox.stub({});
//                    var userName = utils.getRandomString(10);
//                    var updateProps = { userName: userName };
//                    userSvc.save(updateProps, optionsStub);
//                    sinon.assert.calledWithExactly(resourceSvc.save, optionsStub);
//                });
//            });
//
//            describe('getSingle', function() {
//
//                it('calls getSingle on the resource service with the proper options', function() {
//                   var userName = utils.getRandomString(10);
//                   var options = { modelName: 'User', query: { userName: userName } };
//                   userSvc.getSingle(userName);
//                   sinon.assert.calledWithExactly(resourceSvc.getSingle, options);
//                });
//
//            });
//
//            describe('getList', function() {
//
//                it('calls getList on the resource service with the proper options', function() {
//                    var query = utils.getRandomString(10);
//                    var options = { modelName: 'User', query: query };
//                    userSvc.getList(query);
//                    sinon.assert.calledWithExactly(resourceSvc.getList, options);
//                });
//
//
//            });
//
//            describe('addRole', function() {
//
//                it('properly builds the options object', function() {
//
//                    var userName = utils.getRandomString(10);
//                    var roleName = utils.getRandomString(10).toLowerCase();
//                    var options = { userName: userName, role: roleName};
//                    userSvc.optionsBuilder.setAddRoleOptions(options);
//                    options.userName.should.equal(userName);
//                    options.updateOnly.should.equal(true);
//                    options.role.should.equal(roleName);
//                    should.exist(options.preValidation);
//                    options.modelName.should.equal('User');
//                    options.singleSearch.userName.should.equal(userName);
//                    should.exist(options.mapPropertiesToResource);
//
//
//                });
//
//                it('calls save on the resource service with the proper options object', function() {
//                    var userName = utils.getRandomString(10);
//                    var roleName = utils.getRandomString(10).toLowerCase();
//                    userSvc.addRole(userName, roleName);
//                    //Assumes getting called with options object
//                    sinon.assert.calledWith(resourceSvc.save, sinon.match.object);
//                });
//            });
//
//            describe('removeRole', function() {
//
//                it('properly builds the options object', function() {
//
//                    var userName = utils.getRandomString(10);
//                    var roleName = utils.getRandomString(10).toLowerCase();
//                    var options = { userName: userName, role: roleName };
//                    userSvc.optionsBuilder.setRemoveRoleOptions(options, userName, roleName);
//                    options.userName.should.equal(userName);
//                    options.updateOnly.should.equal(true);
//                    options.role.should.equal(roleName);
//                    should.exist(options.preValidation);
//                    options.modelName.should.equal('User');
//                    options.singleSearch.userName.should.equal(userName);
//                    should.exist(options.mapPropertiesToResource);
//
//
//                });
//
//                it('calls save on the resource service with the proper options object', function() {
//                    var userName = utils.getRandomString(10);
//                    var roleName = utils.getRandomString(10).toLowerCase();
//                    userSvc.removeRole(userName, roleName);
//                    //Assumes getting called with options object
//                    sinon.assert.calledWith(resourceSvc.save, sinon.match.object);
//                });
//
//            });
//
//            describe('addFile', function() {
//
//                it('properly builds the options object', function() {
//
//                    var userName = utils.getRandomString(10);
//                    var fileName = utils.getRandomString(10).toLowerCase();
//                    var groupId = utils.getRandomString(10);
//                    var options = { userName: userName, file: fileName, groupId: groupId };
//                    userSvc.optionsBuilder.setAddFileOptions(options);
//                    options.userName.should.equal(userName);
//                    options.updateOnly.should.equal(true);
//                    options.file.should.equal(fileName);
//                    options.groupId.should.equal(groupId);
//                    should.exist(options.preValidation);
//                    options.modelName.should.equal('User');
//                    options.singleSearch.userName.should.equal(userName);
//                    should.exist(options.mapPropertiesToResource);
//
//
//                });
//
//                it('calls save on the resource service with the proper options object', function() {
//                    var userName = utils.getRandomString(10);
//                    var fileName = utils.getRandomString(10).toLowerCase();
//                    var groupId = utils.getRandomString(10);
//                    userSvc.addFile(userName, fileName, groupId);
//                    //Assumes getting called with options object
//                    sinon.assert.calledWith(resourceSvc.save, sinon.match.object);
//                });
//            });
//
//            describe('removeFile', function() {
//
//                it('properly builds the options object', function() {
//
//                    var userName = utils.getRandomString(10);
//                    var fileName = utils.getRandomString(10).toLowerCase();
//                    var groupId = utils.getRandomString(10);
//                    var options = { userName: userName, file: fileName, groupId: groupId };
//                    userSvc.optionsBuilder.setRemoveFileOptions(options);
//                    options.userName.should.equal(userName);
//                    options.updateOnly.should.equal(true);
//                    options.file.should.equal(fileName);
//                    options.groupId.should.equal(groupId);
//                    should.exist(options.preValidation);
//                    options.modelName.should.equal('User');
//                    options.singleSearch.userName.should.equal(userName);
//                    should.exist(options.mapPropertiesToResource);
//
//
//                });
//
//                it('calls save on the resource service with the proper options object', function() {
//                    var userName = utils.getRandomString(10);
//                    var fileName = utils.getRandomString(10).toLowerCase();
//                    var groupId = utils.getRandomString(10);
//                    userSvc.removeFile(userName, fileName, groupId);
//                    //Assumes getting called with options object
//                    sinon.assert.calledWith(resourceSvc.save, sinon.match.object);
//                });
//            });
//
//            afterEach(function() {
//                sandbox.restore();
//            });
//
//        });
//
//
//    });
//});
