"use strict";
require('require-enhanced')();

var sinon = require('sinon');
var should = require('chai').should();
var utils = global.rootRequire('util-test');
var promiseSvc = global.rootRequire('svc-promise');
var proxyquire = require('proxyquire');

describe('controllers', function() {
    describe('userCtrl.js', function() {

        var userSvcStub, errSvcStub, userCtrl,
            linkSvcStub, resStub, reqStub, nextStub, optionsStub;
        var sandbox;
        var addOnly = false;

        beforeEach(function() {

            sandbox = sinon.sandbox.create();
            userSvcStub = sandbox.stub(global.rootRequire('svc-user'));
            errSvcStub = {
                errorFromPromise: function(pid, err) {
                    promiseSvc.reject(err, pid);
                },
                checkErrorCode: sandbox.stub()
            };
            linkSvcStub = sandbox.stub(global.rootRequire('svc-link'));

            userCtrl = proxyquire(global.getRoutePathFromKey('ctrl-user'),
                { userSvc: userSvcStub, linkSvc: linkSvcStub });
            resStub  = sandbox.stub({
                status: function() {},
                send: function() {},
                end: function() {}
            });
            reqStub = sandbox.stub({
               body: {
                   user: {

                   },
                   role: 'admin'
               },
               params: {
                   userName: utils.getRandomString(10)
               }
            });
            nextStub = sandbox.stub();
            optionsStub = { addOnly: addOnly };
            userCtrl._setErrorService(errSvcStub);

        });


        describe('saveUser', function() {

            var fn = null;
            it('returns a route function', function() {

                fn = userCtrl.saveUser();
                should.exist(fn);
                fn.should.be.a('function');

            });


            it('if no user passed in, returns a bad request message', function() {

                fn = userCtrl.saveUser();
                reqStub.body.user = null;
                userSvcStub.save = promiseSvc.makeEmptyPromise(userSvcStub.save);
                fn(reqStub, resStub, nextStub);
                sinon.assert.calledWithExactly(resStub.send, 400, 'Server expects "user"');

            });

            it('calls save on the user service with, the req.user and the addOnly flag', function() {

                fn = userCtrl.saveUser(optionsStub);
                userSvcStub.save = promiseSvc.makeEmptyPromise(userSvcStub.save);
                fn(reqStub, resStub, nextStub);
                sinon.assert.calledWithExactly(userSvcStub.save, reqStub.body.user, { addOnly: optionsStub.addOnly });

            });

            it('if save succeeds and addOnly true, returns a user view model and a 201 status', function(done) {

                optionsStub.addOnly = true;
                fn = userCtrl.saveUser(optionsStub);
                var viewModelStub = { firstName: utils.getRandomString(10) };
                var userStub = { viewModel: function() { return viewModelStub;} };
                userSvcStub.save = promiseSvc.wrapWithPromise(userSvcStub.save)
                    .resolvingWith(userStub);
                fn(reqStub, resStub, function() {
                    sinon.assert.calledWithExactly(resStub.send, 201, viewModelStub);
                    done();
                });

            });

            it('if save succeeds and addOnly false, returns a user view model and a 200 status', function(done) {

                optionsStub.addOnly = false;
                fn = userCtrl.saveUser(optionsStub);
                var viewModelStub = { firstName: utils.getRandomString(10) };
                var userStub = { viewModel: function() { return viewModelStub;} };
                userSvcStub.save = promiseSvc.wrapWithPromise(userSvcStub.save)
                    .resolvingWith(userStub);
                fn(reqStub, resStub, function() {
                    sinon.assert.calledWithExactly(resStub.send, 200, viewModelStub);
                    done();
                });


            });
            it('if save fails, return a 405 if fails due to existing resource', function(done) {

                fn = userCtrl.saveUser(optionsStub);
                var randomErrString = utils.getRandomString(20);
                userSvcStub.save = promiseSvc.wrapWithPromise(userSvcStub.save)
                    .rejectingWith(randomErrString);
                errSvcStub.checkErrorCode.returns(true);
                fn(reqStub, resStub, function() {
                    sinon.assert.calledWithExactly(resStub.send, 405, randomErrString);
                    done();
                });

            });
            it('if save fails, return a 500 for any other failure', function(done) {

                fn = userCtrl.saveUser(optionsStub);
                var randomErrString = utils.getRandomString(20);
                userSvcStub.save = promiseSvc.wrapWithPromise(userSvcStub.save)
                    .rejectingWith(randomErrString);
                errSvcStub.checkErrorCode.returns(false);

                fn(reqStub, resStub, function() {
                    sinon.assert.calledWithExactly(resStub.send, 500, randomErrString);
                    done();
                });



            });

        });

        describe('getUser', function() {

            it('if no userName passed in, returns a bad request message', function() {

                reqStub.params.userName = null;
                userSvcStub.getSingle = promiseSvc.makeEmptyPromise(userSvcStub.getSingle);
                userCtrl.getUser(reqStub, resStub, nextStub);
                sinon.assert.calledWithExactly(resStub.send, 400, "Server expects user name to retrieve user");

            });

            it('calls getSingle on the user service with the req.param.userName', function() {

                userSvcStub.getSingle = promiseSvc.makeEmptyPromise(userSvcStub.getSingle);
                userCtrl.getUser(reqStub, resStub, nextStub);
                sinon.assert.calledWithExactly(userSvcStub.getSingle, reqStub.params.userName);

            });

            it('if getSingle on the user service succeeds, then send 200 and the user view model', function(done) {

                var viewModelStub = { firstName: utils.getRandomString(10) };
                var userStub = { viewModel: function() { return viewModelStub;} };
                userSvcStub.getSingle = promiseSvc.wrapWithPromise(userSvcStub.getSingle)
                    .resolvingWith(userStub);

                userCtrl.getUser(reqStub, resStub, function() {
                    sinon.assert.calledWithExactly(resStub.send, 200, viewModelStub);
                    done();
                });
            });

            it('if getSingle on the user service fails due to no resource, then 404 and error', function(done) {

                var randomErrString = utils.getRandomString(20);
                userSvcStub.getSingle = promiseSvc.wrapWithPromise(userSvcStub.getSingle)
                    .rejectingWith(randomErrString);
                errSvcStub.checkErrorCode.returns(true);
                userCtrl.getUser(reqStub, resStub, function() {
                    sinon.assert.calledWithExactly(resStub.send, 404, randomErrString);
                    done();
                });

            });
            it('if getSingle on the user service fails generally, then 500 and error', function(done) {

                var randomErrString = utils.getRandomString(20);
                userSvcStub.getSingle = promiseSvc.wrapWithPromise(userSvcStub.getSingle)
                    .rejectingWith(randomErrString);
                errSvcStub.checkErrorCode.returns(false);
                userCtrl.getUser(reqStub, resStub, function() {
                    sinon.assert.calledWithExactly(resStub.send, 500, randomErrString);
                    done();
                });

            });


        });

        describe('getUsers', function() {

            it('calls getList on the user service with an empty object', function() {

                userSvcStub.getList = promiseSvc.makeEmptyPromise(userSvcStub.getList);
                userCtrl.getUsers(reqStub, resStub, nextStub);
                sinon.assert.calledWithExactly(userSvcStub.getList, {});

            });

            it('if getList on the user service succeeds, then send 200 and the user view model', function(done) {

                var viewModelStub = { firstName: utils.getRandomString(10) };
                var usersStub = [
                    { viewModel: function() { return viewModelStub;} },
                    { viewModel: function() { return viewModelStub;} }
                ];
                userSvcStub.getList = promiseSvc.wrapWithPromise(userSvcStub.getList)
                    .resolvingWith(usersStub);
                userCtrl.getUsers(reqStub, resStub, function() {
                    sinon.assert.calledWithExactly(resStub.send, 200, [ viewModelStub, viewModelStub]);
                    done();
                });


            });

            it('if getList on the user service fails due to no resource, then send 404 and error', function(done) {

                var randomErrString = utils.getRandomString(20);
                userSvcStub.getList = promiseSvc.wrapWithPromise(userSvcStub.getList)
                    .rejectingWith(randomErrString);
                errSvcStub.checkErrorCode.returns(true);
                userCtrl.getUsers(reqStub, resStub, function() {
                    sinon.assert.calledWithExactly(resStub.send, 404, randomErrString);
                    done();
                });


            });

            it('if getList on the user service fails due to other, then send 500 and error', function(done) {

                var randomErrString = utils.getRandomString(20);
                userSvcStub.getList = promiseSvc.wrapWithPromise(userSvcStub.getList)
                    .rejectingWith(randomErrString);
                errSvcStub.checkErrorCode.returns(false);
                userCtrl.getUsers(reqStub, resStub, function() {
                    sinon.assert.calledWithExactly(resStub.send, 500, randomErrString);
                    done();
                });


            });

        });

        describe('addRole', function() {

            it('if no userName passed in, returns a bad request message', function() {

                reqStub.params.userName = null;
                userSvcStub.addRole = promiseSvc.makeEmptyPromise(userSvcStub.addRole);
                userCtrl.addRole(reqStub, resStub, nextStub);
                sinon.assert.calledWithExactly(resStub.send, 400, 'Server expects "userName" in query');

            });

            it('if no role passed in, returns a bad request message', function() {

                reqStub.body.role = null;
                userSvcStub.addRole = promiseSvc.makeEmptyPromise(userSvcStub.addRole);
                userCtrl.addRole(reqStub, resStub, nextStub);
                sinon.assert.calledWithExactly(resStub.send, 400, 'Server expects "role"');

            });

            it('calls addRole on the user service with the req.param.userName and req.body.role', function() {

                userSvcStub.addRole = promiseSvc.makeEmptyPromise(userSvcStub.addRole);
                userCtrl.addRole(reqStub, resStub, nextStub);
                sinon.assert.calledWithExactly(userSvcStub.addRole, reqStub.params.userName, reqStub.body.role);

            });

            it('if addRole on the user service succeeds, then send 201 and the list of roles', function(done) {

                var rolesStub = [ utils.getRandomString(0), utils.getRandomString(10)];
                var userStub = {
                    roles: rolesStub,
                    userName: reqStub.params.userName
                };
                userSvcStub.addRole = promiseSvc.wrapWithPromise(userSvcStub.addRole)
                    .resolvingWith(userStub);
                linkSvcStub.attachLinksToObject.returns(rolesStub);
                userCtrl.addRole(reqStub, resStub, function() {
                    sinon.assert.calledWithExactly(linkSvcStub.attachLinksToObject,
                        {roles: rolesStub},[{ uri: '/../' + userStub.userName, rel: 'user', isRelative:true}]);
                    sinon.assert.calledWithExactly(resStub.send, 201, rolesStub);
                    done();
                });


            });

            it('if addRole on the user service fails due to already existing, then 400 and error', function(done) {

                var randomErrString = utils.getRandomString(20);
                userSvcStub.addRole = promiseSvc.wrapWithPromise(userSvcStub.addRole)
                    .rejectingWith(randomErrString);
                errSvcStub.checkErrorCode.returns(true);
                userCtrl.addRole(reqStub, resStub, function() {
                    sinon.assert.calledWithExactly(resStub.send, 400, randomErrString);
                    done();
                });

            });

            it('if addRole on the user service fails due to other error, then 500 and error', function(done) {

                var randomErrString = utils.getRandomString(20);
                userSvcStub.addRole = promiseSvc.wrapWithPromise(userSvcStub.addRole)
                    .rejectingWith(randomErrString);
                errSvcStub.checkErrorCode.returns(false);
                userCtrl.addRole(reqStub, resStub, function() {
                    sinon.assert.calledWithExactly(resStub.send, 500, randomErrString);
                    done();
                });

            });


        });

        describe('removeRole', function() {

            it('if no userName passed in, returns a bad request message', function() {

                reqStub.params.userName = null;
                userSvcStub.removeRole = promiseSvc.makeEmptyPromise(userSvcStub.removeRole);
                userCtrl.removeRole(reqStub, resStub, nextStub);
                sinon.assert.calledWithExactly(resStub.send, 400, 'Server expects "userName" in query');

            });

            it('if no role passed in, returns a bad request message', function() {

                reqStub.body.role = null;
                userSvcStub.removeRole = promiseSvc.makeEmptyPromise(userSvcStub.removeRole);
                userCtrl.removeRole(reqStub, resStub, nextStub);
                sinon.assert.calledWithExactly(resStub.send, 400, 'Server expects "role"');

            });

            it('calls removeRole on the user service with the req.param.userName and req.body.role', function() {

                userSvcStub.removeRole = promiseSvc.makeEmptyPromise(userSvcStub.removeRole);
                userCtrl.removeRole(reqStub, resStub, nextStub);
                sinon.assert.calledWithExactly(userSvcStub.removeRole, reqStub.params.userName, reqStub.body.role);

            });

            it('if removeRole on the user service succeeds, then send 200 and the list of roles', function(done) {

                var rolesStub = [ utils.getRandomString(0), utils.getRandomString(10)];
                var userStub = {
                    roles: rolesStub,
                    userName: reqStub.params.userName
                };
                userSvcStub.removeRole = promiseSvc.wrapWithPromise(userSvcStub.removeRole)
                    .resolvingWith(userStub);

                linkSvcStub.attachLinksToObject.returns(rolesStub);
                userCtrl.removeRole(reqStub, resStub, function() {
                    sinon.assert.calledWithExactly(linkSvcStub.attachLinksToObject,
                        {roles: rolesStub},[{ uri: '/../' + userStub.userName, rel: 'user', isRelative:true}]);
                    sinon.assert.calledWithExactly(resStub.send, 200, rolesStub);
                    done();
                });


            });

            it('if removeRole on the user service fails due to already existing, then 400 and error', function(done) {

                var randomErrString = utils.getRandomString(20);
                userSvcStub.removeRole = promiseSvc.wrapWithPromise(userSvcStub.removeRole)
                    .rejectingWith(randomErrString);
                errSvcStub.checkErrorCode.returns(true);
                userCtrl.removeRole(reqStub, resStub, function() {
                    sinon.assert.calledWithExactly(resStub.send, 400, randomErrString);
                    done();
                });

            });

            it('if removeRole on the user service fails due to other error, then 500 and error', function(done) {

                var randomErrString = utils.getRandomString(20);
                userSvcStub.removeRole = promiseSvc.wrapWithPromise(userSvcStub.removeRole)
                    .rejectingWith(randomErrString);
                errSvcStub.checkErrorCode.returns(false);
                userCtrl.removeRole(reqStub, resStub, function() {
                    sinon.assert.calledWithExactly(resStub.send, 500, randomErrString);
                    done();
                });

            });
            
        });

        describe('getRoles', function() {

            it('if no userName passed in, returns a bad request message', function() {

                reqStub.params.userName = null;
                userSvcStub.getSingle = promiseSvc.makeEmptyPromise(userSvcStub.getSingle);
                userCtrl.getRoles(reqStub, resStub, nextStub);
                sinon.assert.calledWithExactly(resStub.send, 400, 'Server expects user name to retrieve user');

            });

            it('calls getSingle on the user service with the req.param.userName', function() {

                userSvcStub.getSingle = promiseSvc.makeEmptyPromise(userSvcStub.getSingle);
                userCtrl.getRoles(reqStub, resStub, nextStub);
                sinon.assert.calledWithExactly(userSvcStub.getSingle, reqStub.params.userName);

            });

            it('if getSingle on the user service succeeds, then send 200 and the list of roles with links', function(done) {

                var rolesStub = [ utils.getRandomString(0), utils.getRandomString(10)];
                var userStub = {
                    roles: rolesStub,
                    userName: reqStub.params.userName
                };
                userSvcStub.getSingle = promiseSvc.wrapWithPromise(userSvcStub.getSingle)
                    .resolvingWith(userStub);

                linkSvcStub.attachLinksToObject.returns(rolesStub);
                userCtrl.getRoles(reqStub, resStub, function() {
                    sinon.assert.calledWithExactly(linkSvcStub.attachLinksToObject,
                        {roles: rolesStub},[{ uri: '/../' + userStub.userName, rel: 'user', isRelative:true}]);
                    sinon.assert.calledWithExactly(resStub.send, 200, rolesStub);
                    done();
                });


            });

            it('if getSingle on the user service fails due to no resource, then 404 and error', function(done) {

                var randomErrString = utils.getRandomString(20);
                userSvcStub.getSingle = promiseSvc.wrapWithPromise(userSvcStub.getSingle)
                    .rejectingWith(randomErrString);
                errSvcStub.checkErrorCode.returns(true);
                userCtrl.getRoles(reqStub, resStub, function() {
                    sinon.assert.calledWithExactly(resStub.send, 404, randomErrString);
                    done();
                });

            });
            it('if getSingle on the user service fails generally, then 500 and error', function(done) {

                var randomErrString = utils.getRandomString(20);
                userSvcStub.getSingle = promiseSvc.wrapWithPromise(userSvcStub.getSingle)
                    .rejectingWith(randomErrString);
                errSvcStub.checkErrorCode.returns(false);
                userCtrl.getRoles(reqStub, resStub, function() {
                    sinon.assert.calledWithExactly(resStub.send, 500, randomErrString);
                    done();
                });

            });

        });

        afterEach(function() {
            sandbox.restore();
        });
    });
});