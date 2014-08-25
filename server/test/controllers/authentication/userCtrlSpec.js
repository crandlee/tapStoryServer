"use strict";
require('require-enhanced')({ test: true });

describe('controllers/authentication/userCtrl.js', function () {

    var sinon = global.sinon, sandbox;

    var userSvcStub, userCtrl,
        linkSvcStub, resStub, reqStub, nextStub, optionsStub;
    var addOnly = false;

    beforeEach(function () {

        sandbox = sinon.sandbox.create();
        linkSvcStub = sandbox.stub(global.rootRequire('svc-link'));
        userSvcStub = sandbox.stub(global.rootRequire('svc-user'));
        userCtrl = global.proxyquire(global.getRoutePathFromKey('ctrl-user'),
            { linkSvc: linkSvcStub });

        resStub = sandbox.stub({
            status: function () {
            },
            send: function () {
            },
            end: function () {
            }
        });
        reqStub = sandbox.stub({
            body: {
                user: {

                },
                role: 'admin'
            },
            params: {
                userName: global.testUtils.getRandomString(10)
            }
        });
        nextStub = sandbox.stub();
        optionsStub = { addOnly: addOnly };

    });


    describe('saveUser', function () {

        var fn = null;
        it('returns a route function', function () {

            fn = userCtrl.saveUser();
            global.should.exist(fn);
            fn.should.be.a('function');

        });

        it('if no user passed in, returns a bad request message', function () {

            fn = userCtrl.saveUser();
            reqStub.body = null;
            fn(reqStub, resStub, nextStub);
            sinon.assert.calledWithExactly(resStub.status, 400);
            sinon.assert.calledWithExactly(resStub.end, 'No request body');
        });

        it('calls save on the user service with the req.user and the addOnly flag', function (done) {

            optionsStub.addOnly = true;
            fn = userCtrl.saveUser(optionsStub);
            userSvcStub.save = global.promiseUtils.getNoopPromiseStub();
            userCtrl._setUserService(userSvcStub);
            fn(reqStub, resStub, nextStub);
            userSvcStub.save()
                .then(function(ret) {
                    ret.args[0].addOnly.should.equal(true);
                    ret.args[1].should.equal(reqStub.body);
                })
                .fail(function(err) {
                    throw err;
                })
                .fin(done)
                .done(function() {
                    sinon.assert.calledOnce(nextStub);
                });


        });

        it('if save succeeds and addOnly true, returns a user view model and a 201 status', function (done) {

            optionsStub.addOnly = true;
            var testRes = { userName: global.testUtils.getRandomString(10),
                viewModel: function() { return this.userName; } };
            userSvcStub.save = global.promiseUtils.getResolveExactlyPromiseStub(testRes);
            userCtrl._setUserService(userSvcStub);
            fn = userCtrl.saveUser(optionsStub);
            fn(reqStub, resStub, nextStub);
            userSvcStub.save()
                .then(function(ret) {
                    sinon.assert.calledWithExactly(resStub.send, 201, ret.userName);
                })
                .fail(function(err) {
                    throw err;
                })
                .fin(done)
                .done(function() {
                    sinon.assert.calledOnce(nextStub);
                });
        });

        it('if save succeeds and addOnly false, returns a user view model and a 200 status', function (done) {

            optionsStub.addOnly = false;
            var testRes = { userName: global.testUtils.getRandomString(10),
                viewModel: function() { return this.userName; } };
            userSvcStub.save = global.promiseUtils.getResolveExactlyPromiseStub(testRes);
            userCtrl._setUserService(userSvcStub);
            fn = userCtrl.saveUser(optionsStub);
            fn(reqStub, resStub, nextStub);
            userSvcStub.save()
                .then(function(ret) {
                    sinon.assert.calledWithExactly(resStub.send, 200, ret.userName);
                })
                .fail(function(err) {
                    throw err;
                })
                .fin(done)
                .done(function() {
                    sinon.assert.calledOnce(nextStub);
                });


        });
        it('if save fails, return a 405 if fails due to existing resource', function (done) {

            optionsStub.addOnly = false;
            var testError = global.testUtils.getRandomString(10);
            userSvcStub.save = global.promiseUtils.getRejectExactlyPromiseStub(testError, null, "E1000");
            userCtrl._setUserService(userSvcStub);
            fn = userCtrl.saveUser(optionsStub);
            fn(reqStub, resStub, nextStub);
            userSvcStub.save()
                .then(function() {
                    throw new Error('Resolved instead of rejecting');
                })
                .fail(function(err) {
                    sinon.assert.calledWithExactly(resStub.status, 405);
                    sinon.assert.calledWithExactly(resStub.end, err.message);
                    err.message.should.contain(testError);
                })
                .fin(done)
                .done(function() {
                    sinon.assert.calledOnce(nextStub);
                });

        });
        it('if save fails, return a 500 for any other failure', function (done) {

            optionsStub.addOnly = false;
            var testError = global.testUtils.getRandomString(10);
            userSvcStub.save = global.promiseUtils.getRejectExactlyPromiseStub(testError);
            userCtrl._setUserService(userSvcStub);
            fn = userCtrl.saveUser(optionsStub);
            fn(reqStub, resStub, nextStub);
            userSvcStub.save()
                .then(function() {
                    throw new Error('Resolved instead of rejecting');
                })
                .fail(function(err) {
                    sinon.assert.calledWithExactly(resStub.status, 500);
                    sinon.assert.calledWithExactly(resStub.end, err.message);
                    err.message.should.contain(testError);
                })
                .fin(done)
                .done(function() {
                    sinon.assert.calledOnce(nextStub);
                });


        });

    });

    describe('getUser', function () {

        it('if no userName passed in, returns a bad request message', function () {

            reqStub.params.userName = null;
            userCtrl.getUser(reqStub, resStub, nextStub);
            sinon.assert.calledWithExactly(resStub.status, 400);
            sinon.assert.calledWithExactly(resStub.end, 'Server expects user name to retrieve user');

        });

        it('calls getSingle on the user service with the req.param.userName', function (done) {

            var userName = global.testUtils.getRandomString(10);
            reqStub.params.userName = userName;
            userSvcStub.getSingle = global.promiseUtils.getNoopPromiseStub();
            userCtrl._setUserService(userSvcStub);
            userCtrl.getUser(reqStub, resStub, nextStub);
            userSvcStub.getSingle()
                .then(function(ret) {
                    ret.args[0].should.equal(userName);
                })
                .fail(function(err) {
                    throw err;
                })
                .fin(done)
                .done(function() {
                    sinon.assert.calledOnce(nextStub);
                });

        });

        it('if getSingle on the user service succeeds, then send 200 and the user view model', function (done) {

            var userName = global.testUtils.getRandomString(10);
            var testRes = { userName: userName,
                viewModel: function() { return this.userName; } };
            reqStub.params.userName = userName;
            userSvcStub.getSingle = global.promiseUtils.getResolveExactlyPromiseStub(testRes);
            userCtrl._setUserService(userSvcStub);
            userCtrl.getUser(reqStub, resStub, nextStub);
            userSvcStub.getSingle()
                .then(function() {
                    sinon.assert.calledWithExactly(resStub.send, 200, userName);
                })
                .fail(function(err) {
                    throw err;
                })
                .fin(done)
                .done(function() {
                    sinon.assert.calledOnce(nextStub);
                });
        });

        it('if getSingle on the user service fails due to no resource, then 404 and error', function (done) {

            reqStub.params.userName = 'anything';
            var testError = global.testUtils.getRandomString(10);
            userSvcStub.getSingle = global.promiseUtils.getRejectExactlyPromiseStub(testError, null, "E1001");
            userCtrl._setUserService(userSvcStub);
            userCtrl.getUser(reqStub, resStub, nextStub);
            userSvcStub.getSingle()
                .then(function() {
                    throw new Error('Resolved instead of rejecting');
                })
                .fail(function(err) {
                    sinon.assert.calledWithExactly(resStub.status, 404);
                    sinon.assert.calledWithExactly(resStub.end, err.message);
                    err.message.should.contain(testError);
                })
                .fin(done)
                .done(function() {
                    sinon.assert.calledOnce(nextStub);
                });

        });

        it('if getSingle on the user service fails generally, then 500 and error', function (done) {

            reqStub.params.userName = 'anything';
            var testError = global.testUtils.getRandomString(10);
            userSvcStub.getSingle = global.promiseUtils.getRejectExactlyPromiseStub(testError);
            userCtrl._setUserService(userSvcStub);
            userCtrl.getUser(reqStub, resStub, nextStub);
            userSvcStub.getSingle()
                .then(function() {
                    throw new Error('Resolved instead of rejecting');
                })
                .fail(function(err) {
                    sinon.assert.calledWithExactly(resStub.status, 500);
                    sinon.assert.calledWithExactly(resStub.end, err.message);
                    err.message.should.contain(testError);
                })
                .fin(done)
                .done(function() {
                    sinon.assert.calledOnce(nextStub);
                });

        });


    });

    describe('getUsers', function () {

        it('calls getList on the user service with an empty object', function (done) {

            userSvcStub.getList = global.promiseUtils.getNoopPromiseStub();
            userCtrl._setUserService(userSvcStub);
            userCtrl.getUsers(reqStub, resStub, nextStub);
            userSvcStub.getList()
                .then(function(ret) {
                    ret.args[0].should.be.an('object');
                    Object.keys(ret.args[0]).length.should.equal(0);
                })
                .fail(function(err) {
                    throw err;
                })
                .fin(done)
                .done(function() {
                    sinon.assert.calledOnce(nextStub);
                });


        });

        it('if getList on the user service succeeds, then send 200 and the user view model', function (done) {

            var viewModelStub = { firstName: global.testUtils.getRandomString(10) };
            var usersStub = [
                { viewModel: function () {
                    return viewModelStub;
                } },
                { viewModel: function () {
                    return viewModelStub;
                } }
            ];
            userSvcStub.getList = global.promiseUtils.getResolveExactlyPromiseStub(usersStub);
            userCtrl._setUserService(userSvcStub);
            userCtrl.getUsers(reqStub, resStub, nextStub);
            userSvcStub.getList()
                .then(function(users) {
                    var viewModels = global._.map(users, function (user) {
                        return user.viewModel('users');
                    });
                    sinon.assert.calledWithExactly(resStub.send, 200, viewModels);
                })
                .fail(function(err) {
                    throw err;
                })
                .fin(done)
                .done(function() {
                    sinon.assert.calledOnce(nextStub);
                });


        });

        it('if getList on the user service fails due to no resource, then send 404 and error', function (done) {

            var testErrString = global.testUtils.getRandomString(20);
            userSvcStub.getList = global.promiseUtils.getRejectExactlyPromiseStub(testErrString, null, "E1001");
            userCtrl._setUserService(userSvcStub);
            userCtrl.getUsers(reqStub, resStub, nextStub);
            userSvcStub.getList()
                .then(function() {
                    throw new Error('Resolved instead of rejected');
                })
                .fail(function(err) {
                    sinon.assert.calledWithExactly(resStub.status, 404);
                    sinon.assert.calledWithExactly(resStub.end, err.message);
                })
                .fin(done)
                .done(function() {
                    sinon.assert.calledOnce(nextStub);
                });


        });

        it('if getList on the user service fails due to other, then send 500 and error', function (done) {

            var testErrString = global.testUtils.getRandomString(20);
            userSvcStub.getList = global.promiseUtils.getRejectExactlyPromiseStub(testErrString);
            userCtrl._setUserService(userSvcStub);
            userCtrl.getUsers(reqStub, resStub, nextStub);
            userSvcStub.getList()
                .then(function() {
                    throw new Error('Resolved instead of rejected');
                })
                .fail(function(err) {
                    sinon.assert.calledWithExactly(resStub.status, 500);
                    sinon.assert.calledWithExactly(resStub.end, err.message);
                })
                .fin(done)
                .done(function() {
                    sinon.assert.calledOnce(nextStub);
                });



        });

    });

    describe('addRole', function () {

        it('if no userName passed in, returns a bad request message', function () {

            reqStub.params.userName = null;
            userCtrl.addRole(reqStub, resStub, nextStub);
            sinon.assert.calledWithExactly(resStub.status, 400);
            sinon.assert.calledWithExactly(resStub.end, 'Server expects "userName" in query');

        });

        it('if no role passed in, returns a bad request message', function () {

            reqStub.body.role = null;
            userCtrl.addRole(reqStub, resStub, nextStub);
            sinon.assert.calledWithExactly(resStub.status, 400);
            sinon.assert.calledWithExactly(resStub.end, 'Server expects "role"');

        });

        it('calls addRole on the user service with the req.param.userName and req.body.role', function (done) {

            var userName = global.testUtils.getRandomString(10);
            var role = global.testUtils.getRandomString(10);
            reqStub.params.userName = userName;
            reqStub.body.role = role;
            userSvcStub.addRole = global.promiseUtils.getNoopPromiseStub();
            userCtrl._setUserService(userSvcStub);
            userCtrl.addRole(reqStub, resStub, nextStub);
            userSvcStub.addRole()
                .then(function(ret) {
                    ret.args[0].should.equal(userName);
                    ret.args[1].should.equal(role);
                })
                .fail(function(err) {
                    throw err;
                })
                .fin(done)
                .done(function() {
                    sinon.assert.calledOnce(nextStub);
                });

        });

        it('if addRole on the user service succeeds, then send 201 and the list of roles', function (done) {

            var rolesStub = [ global.testUtils.getRandomString(10), global.testUtils.getRandomString(10)];
            var userStub = {
                roles: rolesStub,
                userName: global.testUtils.getRandomString(10)
            };
            linkSvcStub.attachLinksToObject.returnsArg(0);
            userSvcStub.addRole = global.promiseUtils.getResolveExactlyPromiseStub(userStub);
            userCtrl._setUserService(userSvcStub);
            userCtrl.addRole(reqStub, resStub, nextStub);
            userSvcStub.addRole()
                .then(function() {
                    sinon.assert.calledWithExactly(resStub.send, 201, { roles : userStub.roles });
                })
                .fail(function(err) {
                    throw err;
                })
                .fin(done)
                .done(function() {
                    sinon.assert.calledOnce(nextStub);
                });


        });

        it('if addRole on the user service fails due to already existing, then 400 and error', function (done) {

            var testError = global.testUtils.getRandomString(10);
            userSvcStub.addRole = global.promiseUtils.getRejectExactlyPromiseStub(testError, null, "E1002");
            userCtrl._setUserService(userSvcStub);
            userCtrl.addRole(reqStub, resStub, nextStub);
            userSvcStub.addRole()
                .then(function() {
                    throw new Error('Resolved instead of rejected');
                })
                .fail(function(err) {
                    sinon.assert.calledWithExactly(resStub.status, 400);
                    sinon.assert.calledWithExactly(resStub.end, err.message);
                    err.message.should.contain(testError);
                })
                .fin(done)
                .done(function() {
                    sinon.assert.calledOnce(nextStub);
                });

        });

        it('if addRole on the user service fails due to other error, then 500 and error', function (done) {

            var testError = global.testUtils.getRandomString(10);
            userSvcStub.addRole = global.promiseUtils.getRejectExactlyPromiseStub(testError);
            userCtrl._setUserService(userSvcStub);
            userCtrl.addRole(reqStub, resStub, nextStub);
            userSvcStub.addRole()
                .then(function() {
                    throw new Error('Resolved instead of rejected');
                })
                .fail(function(err) {
                    sinon.assert.calledWithExactly(resStub.status, 500);
                    sinon.assert.calledWithExactly(resStub.end, err.message);
                    err.message.should.contain(testError);
                })
                .fin(done)
                .done(function() {
                    sinon.assert.calledOnce(nextStub);
                });

        });


    });

    describe('removeRole', function () {

        it('if no userName passed in, returns a bad request message', function () {

            reqStub.params.userName = null;
            userCtrl.removeRole(reqStub, resStub, nextStub);
            sinon.assert.calledWithExactly(resStub.status, 400);
            sinon.assert.calledWithExactly(resStub.end, 'Server expects "userName" in query');

        });

        it('if no role passed in, returns a bad request message', function () {

            reqStub.body.role = null;
            userCtrl.removeRole(reqStub, resStub, nextStub);
            sinon.assert.calledWithExactly(resStub.status, 400);
            sinon.assert.calledWithExactly(resStub.end, 'Server expects "role"');

        });

        it('calls removeRole on the user service with the req.param.userName and req.body.role', function (done) {

            var userName = global.testUtils.getRandomString(10);
            var role = global.testUtils.getRandomString(10);
            reqStub.params.userName = userName;
            reqStub.body.role = role;
            userSvcStub.removeRole = global.promiseUtils.getNoopPromiseStub();
            userCtrl._setUserService(userSvcStub);
            userCtrl.removeRole(reqStub, resStub, nextStub);
            userSvcStub.removeRole()
                .then(function(ret) {
                    ret.args[0].should.equal(userName);
                    ret.args[1].should.equal(role);
                })
                .fail(function(err) {
                    throw err;
                })
                .fin(done)
                .done(function() {
                    sinon.assert.calledOnce(nextStub);
                });

        });

        it('if removeRole on the user service succeeds, then send 200 and the list of roles', function (done) {

            var rolesStub = [ global.testUtils.getRandomString(10), global.testUtils.getRandomString(10)];
            var userStub = {
                roles: rolesStub,
                userName: global.testUtils.getRandomString(10)
            };
            linkSvcStub.attachLinksToObject.returnsArg(0);
            userSvcStub.removeRole = global.promiseUtils.getResolveExactlyPromiseStub(userStub);
            userCtrl._setUserService(userSvcStub);
            userCtrl.removeRole(reqStub, resStub, nextStub);
            userSvcStub.removeRole()
                .then(function() {
                    sinon.assert.calledWithExactly(resStub.send, 200, { roles : userStub.roles });
                })
                .fail(function(err) {
                    throw err;
                })
                .fin(done)
                .done(function() {
                    sinon.assert.calledOnce(nextStub);
                });


        });

        it('if removeRole on the user service fails due to error, then 500 and error', function (done) {

            var testError = global.testUtils.getRandomString(10);
            userSvcStub.addRole = global.promiseUtils.getRejectExactlyPromiseStub(testError);
            userCtrl._setUserService(userSvcStub);
            userCtrl.addRole(reqStub, resStub, nextStub);
            userSvcStub.addRole()
                .then(function() {
                    throw new Error('Resolved instead of rejected');
                })
                .fail(function(err) {
                    sinon.assert.calledWithExactly(resStub.status, 500);
                    sinon.assert.calledWithExactly(resStub.end, err.message);
                    err.message.should.contain(testError);
                })
                .fin(done)
                .done(function() {
                    sinon.assert.calledOnce(nextStub);
                });

        });

    });

    describe('getRoles', function () {

        it('if no userName passed in, returns a bad request message', function () {

            reqStub.params.userName = null;
            userCtrl.getRoles(reqStub, resStub, nextStub);
            sinon.assert.calledWithExactly(resStub.status, 400);
            sinon.assert.calledWithExactly(resStub.end, 'Server expects user name to retrieve user');

        });

        it('calls getSingle on the user service with the req.param.userName', function (done) {

            var userName = global.testUtils.getRandomString(10);
            reqStub.params.userName = userName;
            userSvcStub.getSingle = global.promiseUtils.getNoopPromiseStub();
            userCtrl._setUserService(userSvcStub);
            userCtrl.getRoles(reqStub, resStub, nextStub);
            userSvcStub.getSingle()
                .then(function(ret) {
                    ret.args[0].should.equal(userName);
                })
                .fail(function(err) {
                    throw err;
                })
                .fin(done)
                .done(function() {
                    sinon.assert.calledOnce(nextStub);
                });

        });

        it('if getSingle on the user service succeeds, then send 200 and the list of roles with links', function (done) {

            var userName = global.testUtils.getRandomString(10);
            var testRes = { userName: userName, roles: [global.testUtils.getRandomString(10), global.testUtils.getRandomString(10)] };
            reqStub.params.userName = userName;
            linkSvcStub.attachLinksToObject.returnsArg(0);
            userSvcStub.getSingle = global.promiseUtils.getResolveExactlyPromiseStub(testRes);
            userCtrl._setUserService(userSvcStub);
            userCtrl.getRoles(reqStub, resStub, nextStub);
            userSvcStub.getSingle()
                .then(function() {
                    sinon.assert.calledWithExactly(resStub.send, 200, { roles: testRes.roles });
                })
                .fail(function(err) {
                    throw err;
                })
                .fin(done)
                .done(function() {
                    sinon.assert.calledOnce(nextStub);
                });


        });

        it('if getSingle on the user service fails due to no resource, then 404 and error', function (done) {

            reqStub.params.userName = 'anything';
            var testError = global.testUtils.getRandomString(10);
            userSvcStub.getSingle = global.promiseUtils.getRejectExactlyPromiseStub(testError, null, "E1001");
            userCtrl._setUserService(userSvcStub);
            userCtrl.getRoles(reqStub, resStub, nextStub);
            userSvcStub.getSingle()
                .then(function() {
                    throw new Error('Resolved instead of rejecting');
                })
                .fail(function(err) {
                    sinon.assert.calledWithExactly(resStub.status, 404);
                    sinon.assert.calledWithExactly(resStub.end, err.message);
                    err.message.should.contain(testError);
                })
                .fin(done)
                .done(function() {
                    sinon.assert.calledOnce(nextStub);
                });

        });

        it('if getSingle on the user service fails generally, then 500 and error', function (done) {

            reqStub.params.userName = 'anything';
            var testError = global.testUtils.getRandomString(10);
            userSvcStub.getSingle = global.promiseUtils.getRejectExactlyPromiseStub(testError);
            userCtrl._setUserService(userSvcStub);
            userCtrl.getRoles(reqStub, resStub, nextStub);
            userSvcStub.getSingle()
                .then(function() {
                    throw new Error('Resolved instead of rejecting');
                })
                .fail(function(err) {
                    sinon.assert.calledWithExactly(resStub.status, 500);
                    sinon.assert.calledWithExactly(resStub.end, err.message);
                    err.message.should.contain(testError);
                })
                .fin(done)
                .done(function() {
                    sinon.assert.calledOnce(nextStub);
                });

        });

    });

    afterEach(function () {
        sandbox.restore();
    });
});