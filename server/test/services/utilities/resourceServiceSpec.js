var sinon = require('sinon');
var should = require('chai').should();
var proxyquire = require('proxyquire');
var utils = require('../../utilities/testUtilities');
var promiseSvc = require('../../../services/promises/promiseService');


describe('services', function () {
    describe('utilities', function () {

        var sandbox;
        var resSvc, errSvcStub, mongooseStub;

        beforeEach(function () {

            sandbox = sinon.sandbox.create();
            errSvcStub = {
                errorFromPromise: function (pid, err) {
                    resSvc._test.rejectPromise(err, pid);
                }
            };

            mongooseStub = sandbox.stub({
                model: function () {

                }
            });
            resSvc = proxyquire('../../../services/utilities/resourceService',
                { mongoose: mongooseStub });
            resSvc._test.setErrorService(errSvcStub);

        });

        describe('resourceService.js', function () {

            describe('_getModelFromOptions', function () {

                it('returns the model from mongoose', function () {

                    var modelName = utils.getRandomString(10);
                    var testRet = { testObject: utils.getRandomString(10) };
                    var options = { model: modelName };
                    mongooseStub.model.returns(testRet);
                    var model = resSvc._getModelFromOptions(options);
                    sinon.assert.calledWithExactly(mongooseStub.model, modelName);
                    should.exist(model);
                    model.should.equal(testRet);

                });

            });

            describe('save', function () {
                //The setup for this one is terrible.  Punting for now.
            });
            describe('getSingle', function () {

                it('calls model.findOne with query and select', function () {

                    var options = {
                        query: utils.getRandomString(10),
                        select: utils.getRandomString(10),
                        testMode: true
                    };
                    var modelStub = sandbox.stub({
                        findOne: function () {
                        }
                    });
                    modelStub.findOne.returns({exec: function (cb) {
                    }});
                    options.model = modelStub;
                    resSvc.getSingle(options);
                    sinon.assert.calledWithExactly(modelStub.findOne, options.query, options.select);
                });

                it('returns a promise that resolves to an array of resources when found', function (done) {
                    var testResource =
                        { id: utils.getRandomString(10)};
                    var options = {
                        query: utils.getRandomString(10),
                        select: utils.getRandomString(10)
                    };
                    var modelStub = sandbox.stub({
                        findOne: function () {
                        }
                    });
                    modelStub.findOne.returns({
                        exec: function (cb) {
                            cb(null, testResource);
                        }
                    });
                    options.model = modelStub;
                    resSvc.getSingle(options).done(function (resource) {
                        resource.should.equal(testResource);
                        done();
                    }, function () {
                        throw new Error('Rejected but should have resolved');
                    });

                });

                it('rejects when query not passed in', function (done) {
                    var options = {
                        query: null,
                        select: utils.getRandomString(10)
                    };
                    options.model = {};
                    resSvc.getSingle(options).done(function () {
                        throw new Error('Resolved but should have rejected');
                    }, function (err) {
                        should.exist(err);
                        done();
                    });

                });

                it('rejects when err returned from model.findOne', function (done) {
                    var options = {
                        query: utils.getRandomString(10),
                        select: utils.getRandomString(10)
                    };
                    var modelStub = sandbox.stub({
                        findOne: function () {
                        }
                    });
                    var randomErrString = utils.getRandomString(10);
                    modelStub.findOne.returns({
                        exec: function (cb) {
                            cb(randomErrString, null);
                        }
                    });
                    options.model = modelStub;

                    resSvc.getSingle(options).done(function () {
                        throw new Error('Resolved but should have rejected');
                    }, function (err) {
                        should.exist(err);
                        err.should.equal(randomErrString);
                        done();
                    });

                });

                it('rejects when resource is empty', function (done) {
                    var options = {
                        query: utils.getRandomString(10),
                        select: utils.getRandomString(10)
                    };
                    var modelStub = sandbox.stub({
                        findOne: function () {
                        }
                    });
                    modelStub.findOne.returns({
                        exec: function (cb) {
                            cb(null, null);
                        }
                    });
                    options.model = modelStub;

                    resSvc.getSingle(options).done(function () {
                        throw new Error('Resolved but should have rejected');
                    }, function (err) {
                        should.exist(err);
                        done();
                    });

                });

            });

            describe('getList', function () {

                it('calls model.find with query and select', function () {

                    var options = {
                        query: utils.getRandomString(10),
                        select: utils.getRandomString(10),
                        testMode: true
                    };
                    var modelStub = sandbox.stub({
                        find: function () {
                        }
                    });
                    modelStub.find.returns({exec: function (cb) {
                    }});
                    options.model = modelStub;
                    resSvc.getList(options);
                    sinon.assert.calledWithExactly(modelStub.find, options.query, options.select);
                });

                it('returns a promise that resolves to an array of resources when found', function (done) {
                    var testResources = [
                        { id: utils.getRandomString(10)},
                        { id: utils.getRandomString(10) }
                    ];
                    var options = {
                        query: utils.getRandomString(10),
                        select: utils.getRandomString(10)
                    };
                    var modelStub = sandbox.stub({
                        find: function () {
                        }
                    });
                    modelStub.find.returns({
                        exec: function (cb) {
                            cb(null, testResources);
                        }
                    });
                    options.model = modelStub;
                    resSvc.getList(options).done(function (resources) {
                        resources.should.equal(testResources);
                        done();
                    }, function () {
                        throw new Error('Rejected but should have resolved');
                    });

                });

                it('rejects when err returned from model.find', function (done) {
                    var options = {
                        query: utils.getRandomString(10),
                        select: utils.getRandomString(10)
                    };
                    var modelStub = sandbox.stub({
                        find: function () {
                        }
                    });
                    var randomErrString = utils.getRandomString(10);
                    modelStub.find.returns({
                        exec: function (cb) {
                            cb(randomErrString, null);
                        }
                    });
                    options.model = modelStub;

                    resSvc.getList(options).done(function () {
                        throw new Error('Resolved but should have rejected');
                    }, function (err) {
                        should.exist(err);
                        err.should.equal(randomErrString);
                        done();
                    });

                });

                it('rejects when query not passed in', function (done) {
                    var options = {
                        query: null,
                        select: utils.getRandomString(10)
                    };
                    options.model = {};

                    resSvc.getList(options).done(function () {
                        throw new Error('Resolved but should have rejected');
                    }, function (err) {
                        should.exist(err);
                        done();
                    });

                });

                it('rejects when resources are empty', function (done) {
                    var testResources = [];
                    var options = {
                        query: utils.getRandomString(10),
                        select: utils.getRandomString(10)
                    };
                    var modelStub = sandbox.stub({
                        find: function () {
                        }
                    });
                    modelStub.find.returns({
                        exec: function (cb) {
                            cb(null, testResources);
                        }
                    });
                    options.model = modelStub;

                    resSvc.getList(options).done(function () {
                        throw new Error('Resolved but should have rejected');
                    }, function (err) {
                        should.exist(err);
                        done();
                    });

                });

            });
        });

        afterEach(function () {
            sandbox.restore();
        });
    });
});