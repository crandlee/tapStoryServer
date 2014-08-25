"use strict";
require('require-enhanced')({ test: true });

var mongoose = require('mongoose');
var uuid = require('node-uuid');

describe('models/authentication/UserSpec.js', function () {

    var sinon = global.sinon, sandbox, encUtility, authorizeSvc;
    var User, testRole, testUser;

    before(function () {

        sandbox = sinon.sandbox.create();
        encUtility = sandbox.stub(global.rootRequire('util-encryption'));
        authorizeSvc = sandbox.stub(global.rootRequire('svc-auth'));
        global.errSvc.bypassLogger(true);

        global.proxyquire(global.getRoutePathFromKey('model-User'),
            { encryptionUtility: encUtility, authorizeSvc: authorizeSvc });

        User = mongoose.model('User');

        testRole = global.testUtils.getRandomString(10);
        testUser = new User(
            { firstName: global.testUtils.getRandomString(10),
                lastName: global.testUtils.getRandomString(10),
                userName: global.testUtils.getRandomString(10),
                userSecret: global.testUtils.getRandomString(16),
                roles: [testRole],
                fileGroup: []
            });

    });

    //Model instance methods
    describe('addFile', function () {

        beforeEach(function () {
            testUser.fileGroup = [];
        });

        it('fails when fileName is empty', function () {
            testUser.addFile.bind(testUser, '').should.throw(Error);
        });

        it('adds a single file to an empty list with fileName and groupId', function () {
            var testFileName = global.testUtils.getRandomString(20);
            var groupId = uuid.v4();
            var ret = testUser.addFile(testFileName, groupId);
            global.should.exist(ret);
            ret.should.equal(groupId);
            testUser.fileGroup.length.should.equal(1);
            testUser.fileGroup[0].files.length.should.equal(1);
        });

        it('adds the file to the list sorted by groupId, fileName when file is new', function () {
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

        it('fails when the file already exists', function () {
            var groupId = uuid.v4(), fileName = global.testUtils.getRandomString(20);
            global.should.exist(testUser.addFile(groupId, fileName));
            global.should.not.exist(testUser.addFile(groupId, fileName));
        });


        it('defaults the groupId when none is passed in', function () {
            var ret = testUser.addFile(global.testUtils.getRandomString(20));
            global.should.exist(ret);
            ret.should.be.a('String');
        });
    });

    describe('removeFile', function () {

        beforeEach(function () {
            testUser.fileGroup = [];
        });

        it('does nothing when file does not exist', function () {

            var testFileName = global.testUtils.getRandomString(20);
            var groupId = uuid.v4();
            testUser.addFile(testFileName, groupId);
            testUser.fileGroup.length.should.equal(1);
            testUser.fileGroup[0].files.length.should.equal(1);
            testUser.removeFile(uuid.v4(), testFileName);
            testUser.fileGroup.length.should.equal(1);
            testUser.fileGroup[0].files.length.should.equal(1);

        });
        it('removes the file when file does exist', function () {

            var testFileName = global.testUtils.getRandomString(20).toLowerCase();
            var testFileName2 = global.testUtils.getRandomString(20).toLowerCase();
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

            var passwordToMatch = global.testUtils.getRandomString(16);
            var utilReturns = true;
            encUtility.checkEqualToken.returns(utilReturns);
            var ret = testUser.authenticate(passwordToMatch);

            sinon.assert.calledWithExactly(encUtility.checkEqualToken, passwordToMatch, testUser.userSecret);
            global.should.exist(ret);
            ret.should.equal(utilReturns);

        });


    });

    describe('hasRole', function () {

        it('returns true when the role exists on the user', function () {

            authorizeSvc.isValidRole.returns(true);
            testUser.hasRole(testRole).should.equal(true);

        });

        it('returns false when the role does not exist on the user', function () {

            authorizeSvc.isValidRole.returns(true);
            testUser.hasRole('dummyRole').should.equal(false);

        });

    });

    describe('viewModel', function () {

        it('returns an object when called with "user"', function () {

            global.should.exist(testUser.viewModel('user'));

        });

        it('returns an object when called with "users"', function () {

            global.should.exist(testUser.viewModel('users'));

        });

        it('returns an object when called with no param', function () {

            global.should.exist(testUser.viewModel());

        });

    });


    after(function () {
        sandbox.restore();
    });

});