var sinon = require('sinon');
var should = require('chai').should();
var proxyquire = require('proxyquire');
var utils = require('../../utilities/testUtilities');

describe('services', function () {
    describe('authentication', function () {

        var sandbox;
        var userSvc;
        var errSvc;
        var resourceSvc;
        var encryptionSvc;
        var authorizeSvc;
        var promiseSvc;

        describe('userService.js', function () {

            beforeEach(function() {

                sandbox = sinon.sandbox.create();
                errSvc = sandbox.stub(require('../../../services/error/errorService')(null, "userService"));
                resourceSvc = sandbox.stub(require('../../../services/utilities/resourceService'));
                encryptionSvc = sandbox.stub(require('../../../utilities/encryptionUtility'));
                authorizeSvc = sandbox.stub(require('../../../services/authorization/authorizationService'));
                promiseSvc = sandbox.stub(require('../../../services/promises/promiseService'));
                userSvc = proxyquire('../../../services/authentication/userService',
                    { resourceSvc: resourceSvc,
                        encryptionSvc: encryptionSvc, authorizeSvc: authorizeSvc, promiseSvc: promiseSvc });

                userSvc._setErrorService(errSvc);
            });

            describe('save', function() {

                it('properly builds the options object', function() {
                    var optionsStub = sandbox.stub({});
                    var userName = utils.getRandomString(10);
                    userSvc.save({ userName: userName }, optionsStub);
                    optionsStub.userName = userName;
                    should.exist(optionsStub.preValidation);
                    optionsStub.onNew.roles.should.equal('user');
                    optionsStub.model.should.equal('User');
                    optionsStub.singleSearch.userName.should.equal(userName);
                    should.exist(optionsStub.mapPropertiesToResource);
                });

                it('calls save on the resource service', function() {
                    var optionsStub = sandbox.stub({});
                    var userName = utils.getRandomString(10);
                    var updateProps = { userName: userName };
                    userSvc.save(updateProps, optionsStub);
                    sinon.assert.calledWithExactly(resourceSvc.save, updateProps, optionsStub);
                });
            });

            describe('getSingle', function() {

                it('calls getSingle on the resource service with the proper options', function() {
                   var userName = utils.getRandomString(10);
                   var options = { model: 'User', query: { userName: userName } };
                   userSvc.getSingle(userName);
                   sinon.assert.calledWithExactly(resourceSvc.getSingle, options);
                });

            });

            describe('getList', function() {

                it('calls getList on the resource service with the proper options', function() {
                    var query = utils.getRandomString(10);
                    var options = { model: 'User', query: query };
                    userSvc.getList(query);
                    sinon.assert.calledWithExactly(resourceSvc.getList, options);
                });


            });

            describe('addRole', function() {

                it('properly builds the options object', function() {

                    var userName = utils.getRandomString(10);
                    var roleName = utils.getRandomString(10).toLowerCase();
                    var options = userSvc.getOptionsObject('addRole', userName, roleName);
                    options.userName.should.equal(userName);
                    options.updateOnly.should.equal(true);
                    options.role.should.equal(roleName);
                    should.exist(options.preValidation);
                    options.model.should.equal('User');
                    options.singleSearch.userName.should.equal(userName);
                    should.exist(options.mapPropertiesToResource);


                });

                it('calls save on the resource service with the proper options object', function() {
                    var userName = utils.getRandomString(10);
                    var roleName = utils.getRandomString(10).toLowerCase();
                    userSvc.addRole(userName, roleName);
                    var updateProps = { role: roleName };
                    //Assumes getting called with options object
                    sinon.assert.calledWith(resourceSvc.save, updateProps, sinon.match.object);
                });
            });

            describe('removeRole', function() {

                it('properly builds the options object', function() {

                    var userName = utils.getRandomString(10);
                    var roleName = utils.getRandomString(10).toLowerCase();
                    var options = userSvc.getOptionsObject('removeRole', userName, roleName);
                    options.userName.should.equal(userName);
                    options.updateOnly.should.equal(true);
                    options.role.should.equal(roleName);
                    should.exist(options.preValidation);
                    options.model.should.equal('User');
                    options.singleSearch.userName.should.equal(userName);
                    should.exist(options.mapPropertiesToResource);


                });

                it('calls save on the resource service with the proper options object', function() {
                    var userName = utils.getRandomString(10);
                    var roleName = utils.getRandomString(10).toLowerCase();
                    userSvc.removeRole(userName, roleName);
                    var updateProps = { role: roleName };
                    //Assumes getting called with options object
                    sinon.assert.calledWith(resourceSvc.save, updateProps, sinon.match.object);
                });

            });

            afterEach(function() {
                sandbox.restore();
            });

        });


    });
});
