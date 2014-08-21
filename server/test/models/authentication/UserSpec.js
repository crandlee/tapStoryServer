"use strict";
require('require-enhanced')();

var sinon = require('sinon');
var mongoose = require('mongoose');
var utils = global.rootRequire('util-test');
var should = require('chai').should();
var proxyquire = require('proxyquire');
var uuid = require('node-uuid');

describe('models', function () {

    var sandbox, encUtility, authorizeSvc, errSvc;
    var User, testRole, testUser;

    before(function() {

        sandbox = sinon.sandbox.create();
        encUtility = sandbox.stub(global.rootRequire('util-encryption'));
        authorizeSvc = sandbox.stub(global.rootRequire('svc-auth'));
        errSvc = sandbox.stub(global.rootRequire('svc-error'));
        errSvc.throwError.throws(new Error());

        proxyquire(global.getRoutePathFromKey('model-User'),
        { encryptionUtility: encUtility, authorizeSvc: authorizeSvc, errSvc: errSvc });

        User = mongoose.model('User');

        testRole = utils.getRandomString(10);
        testUser = new User(
            { firstName: utils.getRandomString(10),
                lastName: utils.getRandomString(10),
                userName: utils.getRandomString(10),
                userSecret: utils.getRandomString(16),
                roles: [testRole],
                fileGroup: []
            });

    });



    describe('authentication', function () {

        describe('User.js', function () {



            //Model instance methods
            describe('addFile', function() {

                beforeEach(function() {
                    testUser.fileGroup = [];
                });

                it('fails when fileName is empty', function(){
                    testUser.addFile.bind(testUser, '').should.throw(Error);
                });

                it('adds a single file to an empty list with fileName and groupId', function() {
                    var testFileName = utils.getRandomString(20);
                    var groupId = uuid.v4();
                    var ret = testUser.addFile(testFileName, groupId);
                    should.exist(ret);
                    ret.should.equal(groupId);
                    testUser.fileGroup.length.should.equal(1);
                    testUser.fileGroup[0].files.length.should.equal(1);
                });

                it('adds the file to the list sorted by groupId, fileName when file is new', function() {
                    var groupId1 = uuid.v4(), groupId2 = uuid.v4(),
                        largerId = groupId1 > groupId2 ? groupId1 : groupId2,
                        smallerId = groupId1 > groupId2 ? groupId2 : groupId1;

                    testUser.addFile('aaaaaaa', largerId);
                    testUser.addFile('zzzzzzz', largerId);
                    testUser.addFile('bbbbbbb', smallerId);

                    testUser.fileGroup.length.should.equal(2);

                    testUser.fileGroup[0].groupId.should.equal(smallerId);
                    testUser.fileGroup[1].files[0].should.equal('aaaaaaa');
                });

                it('fails when the file already exists', function() {
                    var groupId = uuid.v4(), fileName = utils.getRandomString(20);
                    should.exist(testUser.addFile(groupId, fileName));
                    should.not.exist(testUser.addFile(groupId, fileName));
                });


                it('defaults the groupId when none is passed in', function() {
                    var ret = testUser.addFile(utils.getRandomString(20));
                    should.exist(ret);
                    ret.should.be.a('String');
                });
            });

            describe('removeFile', function() {

                beforeEach(function() {
                    testUser.fileGroup = [];
                });

                it('does nothing when file does not exist', function() {

                    var testFileName = utils.getRandomString(20);
                    var groupId = uuid.v4();
                    testUser.addFile(testFileName, groupId);
                    testUser.fileGroup.length.should.equal(1);
                    testUser.fileGroup[0].files.length.should.equal(1);
                    testUser.removeFile(uuid.v4(), testFileName);
                    testUser.fileGroup.length.should.equal(1);
                    testUser.fileGroup[0].files.length.should.equal(1);

                });
                it('removes the file when file does exist', function() {

                    var testFileName = utils.getRandomString(20).toLowerCase();
                    var testFileName2 = utils.getRandomString(20).toLowerCase();
                    var groupId = uuid.v4();
                    var groupId2 = uuid.v4();
                    testUser.addFile(testFileName, groupId);
                    testUser.addFile(testFileName2, groupId);
                    testUser.addFile(testFileName2, groupId2);
                    testUser.fileGroup.length.should.equal(2);
                    testUser.removeFile(groupId2, testFileName2);
                    testUser.fileGroup[0].files.length.should.equal(2);
                    testUser.removeFile(groupId, testFileName);
                    testUser.fileGroup.length.should.equal(1);
                    testUser.fileGroup[0].files.length.should.equal(1);
                    testUser.removeFile(groupId, testFileName2);
                    testUser.fileGroup.length.should.equal(0);
                });
            });

            describe('authenticate', function () {

                it('returns what is passed into the encrpytion utility', function () {

                    var passwordToMatch = utils.getRandomString(16);
                    var utilReturns = true;
                    encUtility.checkEqualToken.returns(utilReturns);
                    var ret = testUser.authenticate(passwordToMatch);

                    sinon.assert.calledWithExactly(encUtility.checkEqualToken, passwordToMatch, testUser.userSecret);
                    should.exist(ret);
                    ret.should.equal(utilReturns);

                });


            });

            describe('hasRole', function() {

                it('returns true when the role exists on the user', function() {

                    authorizeSvc.isValidRole.returns(true);
                    testUser.hasRole(testRole).should.equal(true);

                });

                it('returns false when the role does not exist on the user', function() {

                    authorizeSvc.isValidRole.returns(true);
                    testUser.hasRole('dummyRole').should.equal(false);

                });

            });

            describe('viewModel', function() {

                it('returns an object when called with "user"', function() {

                    should.exist(testUser.viewModel('user'));

                });

                it('returns an object when called with "users"', function() {

                    should.exist(testUser.viewModel('users'));

                });

                it('returns an object when called with no param', function() {

                    should.exist(testUser.viewModel());

                });

            });


        });
    });

    after(function() {
       sandbox.restore();
    });
});