"use strict";
var cb = require('common-bundle')({test:true});
var should = cb.should;
var sinon = cb.sinon;
var testUtils = cb.testUtils;
var promiseUtils = cb.promiseUtils;

describe('services/utilities/resourceService', function () {

    var sandbox;
    var resSvc, mongooseStub;

    beforeEach(function () {

        cb.errSvc.bypassLogger(true);
        sandbox = sinon.sandbox.create();
        mongooseStub = sandbox.stub({
            model: function () {

            }
        });
        resSvc = cb.proxyquire(cb.getRoutePathFromKey('svc-resource'),
            { mongoose: mongooseStub });

    });

    describe('_getModelFromOptions', function () {

        it('returns the model from mongoose', function () {

            var modelName = testUtils.getRandomString(10);
            var testRet = { testObject: testUtils.getRandomString(10) };
            var options = { modelName: modelName };
            mongooseStub.model.returns(testRet);
            var model = resSvc._getModelFromOptions(options);
            sinon.assert.calledWithExactly(mongooseStub.model, modelName);
            should.exist(model);
            model.should.equal(testRet);

        });

        it('throws an error when no model is returned from mongoose', function() {
            mongooseStub.model.returns(null);
            resSvc._getModelFromOptions.bind(resSvc, {}).should.throw();
        });

    });

    describe('save', function () {

        function getServiceOptionsStub() {
            return {
                preValidation: cb.Promise.fbind(function(opts) { return opts; }),
                onNew: { roles: 'user', _id: testUtils.getRandomString(10) },
                modelName: 'User',
                singleSearch: { userName: 'test' },
                mapOptionsToDocument: cb.Promise.fbind(function(resource) { return resource; })
            };
        }

        it('fails when singleSearch is not set on the options input', function(done) {
            var options = {
                singleSearch: null,
                mapOptionsToDocument: function() {},
                model: {}
            };
            var checkRejection = function(err) {
                should.exist(err);
                err.toString().should.contain('No search criteria');
            };
            resSvc.save(options).fail(checkRejection).fin(done).done();
        });

        it('fails when mapOptionsToDocument is not set on the options input', function(done) {
            var options = {
                singleSearch: {},
                mapOptionsToDocument: null,
                model: {}
            };
            var checkRejection = function(err) {
                should.exist(err);
                err.toString().should.contain('Missing map function');
            };
            resSvc.save(options).fail(checkRejection).fin(done).done();
        });

        it('calls findOne on the model to check for existing resource', function(done) {

            var opts = getServiceOptionsStub();
            var testRes = testUtils.getRandomString(10);
            opts.model = { findOne: function() {
                return {
                    exec: promiseUtils.getResolveExactlyPromiseStub(testRes)
                };
            }

            };

            opts.addResourceStub = function(opts) {};
            opts.updateResourceStub = function(opts, resource) { return resource; };
            resSvc.save(opts).fin(done).then(function(ret) {
                ret.should.equal(testRes);
            }).fail(function(err) {
                throw err;
            })
            .done();

        });

        it('throws an error when the call to findOne rejects', function(done) {

            var opts = getServiceOptionsStub();
            var testError = testUtils.getRandomString(20);
            opts.model = { findOne: function() {
                return {
                    exec: promiseUtils.getRejectingPromiseStub(testError)
                };
            }

            };
            resSvc.save(opts).fin(done).then(function() {
                throw new Error('Resolved when it should have rejected');
            }).fail(function(err) {
                err.message.should.contain(testError);
            }).done();

        });

        it('it rejects when trying to add with updateOnly option', function(done) {

            var opts = getServiceOptionsStub();
            opts.model = { findOne: function() {
                return {
                    exec: promiseUtils.getResolveNullPromiseStub()
                };
            }};

            opts.updateOnly = true;

            resSvc.save(opts).fin(done).then(function() {
                throw new Error('Resolved when it should have rejected');
            }).fail(function(err) {
                err.message.should.contain('Can only update');
            }).done();

        });

        it('throws an error when model.create fails', function(done) {

            var opts = getServiceOptionsStub();
            var testError = testUtils.getRandomString(10);
            opts.model = { findOne: function() {
                return {
                    exec: promiseUtils.getResolveNullPromiseStub()
                };
            },
                create: promiseUtils.getRejectExactlyPromiseStub(testError)
            };
            resSvc.save(opts).fin(done).then(function() {
                throw new Error('Resolved when it should have rejected');
            }).fail(function(err) {
                err.message.should.contain(testError);
            }).done();

        });

        it('returns a resource when the return value from model.create is valid and has in _id', function(done) {

            var opts = getServiceOptionsStub();
            opts.model = { findOne: function() {
                return {
                    exec: promiseUtils.getResolveNullPromiseStub()
                };
            },
                create: promiseUtils.getResolveExactlyPromiseStub(opts.onNew)
            };
            resSvc.save(opts).fin(done).then(function(ret) {
                ret.should.equal(opts.onNew);
            }).fail(function(err) {
                throw err;
            }).done();

        });


        it('it rejects when trying to update with addOnly option', function(done) {

            var opts = getServiceOptionsStub();
            opts.model = { findOne: function() {
                return {
                    exec: promiseUtils.getResolveExactlyPromiseStub(opts.onNew)
                };
            }};
            opts.addOnly = true;

            resSvc.save(opts).fin(done).then(function() {
                throw new Error('Resolved when it should have rejected');
            }).fail(function(err) {
                err.message.should.contain('Can only create');
            }).done();

        });

        it('throws an error when model.save fails', function(done) {

            var opts = getServiceOptionsStub();
            var testError = testUtils.getRandomString(10);
            opts.testResource = {
              save: function(cb) { cb(new Error(testError)); }
            };
            opts.model = { findOne: function() {
                return {
                    exec: promiseUtils.getResolveExactlyPromiseStub(opts.onNew)
                };
            }};
            resSvc.save(opts).fin(done).then(function() {
                throw new Error('Resolved when it should have rejected');
            }).fail(function(err) {
                err.message.should.contain(testError);
            }).done();

        });

        it('returns a resource when the call to model.save does not err', function(done) {

            var opts = getServiceOptionsStub();

            opts.testResource = {
                save: function(cb) { cb(null); }
            };
            opts.model = { findOne: function() {
                return {
                    exec: promiseUtils.getResolveExactlyPromiseStub(opts.onNew)
                };
            }};

            resSvc.save(opts).fin(done).then(function(ret) {
                ret.should.equal(opts.testResource);
            }).fail(function(err) {
                throw err;
            }).done();

        });

    });

    describe('getSingle', function () {

        it('rejects when query not passed in', function (done) {
            var options = {
                query: null,
                select: testUtils.getRandomString(10),
                model: {}
            };
            var checkRejection = function(err) {
                should.exist(err);
                err.toString().should.contain('No query provided');
            };
            resSvc.getSingle(options).fail(checkRejection).done(done, done);
        });

        it('calls model.findOne with query and select', function (done) {

            var options = {
                query: testUtils.getRandomString(10),
                select: testUtils.getRandomString(10)
            };
            var testRes = testUtils.getRandomString(10);
            options.model = { findOne: function() {
                return {
                    exec: promiseUtils.getResolveExactlyPromiseStub(testRes)
                };
            }};
            resSvc.getSingle(options).fin(done).then(function(ret) {
                ret.should.equal(testRes);
                //ret.args[0].should.equal(options.query);
                //ret.args[1].should.equal(options.select);
            }).fail(function(err) {
                throw err;
            }).done();

        });


        it('rejects when err returned from model.findOne', function (done) {
            var options = {
                query: 'anything',
                select: 'anything'
            };
            var randomErrString = testUtils.getRandomString(10);
            options.model = { findOne: function() {
                return {
                    exec: promiseUtils.getRejectExactlyPromiseStub(randomErrString)
                };
            }};

            resSvc.getSingle(options).fin(done).done(function () {
                throw new Error('Resolved but should have rejected');
            }, function (err) {
                err.message.should.contain(randomErrString);
            });


        });

        it('rejects when resource is empty', function (done) {
            var options = {
                query: 'anything',
                select: 'anything'
            };
            options.model = { findOne: promiseUtils.getResolveNullPromiseStub()};
            resSvc.getSingle(options).fin(done)
            .then(function () {
                throw new Error('Resolved but should have rejected');
            })
            .fail(function (err) {
                err.toString().should.contain('No resource was returned');
            });
        });

    });

    describe('getList', function () {

        it('rejects when query not passed in', function (done) {
            var options = {
                query: null,
                select: testUtils.getRandomString(10),
                model: {}
            };
            var checkRejection = function(err) {
                should.exist(err);
                err.toString().should.contain('No query provided');
            };
            resSvc.getList(options).fail(checkRejection).done(done, done);
        });


        it('calls model.find with query and select', function (done) {
            var testRes = testUtils.getRandomString(10);
            var options = {
                query: testUtils.getRandomString(10),
                select: testUtils.getRandomString(10)
            };

            options.model = { find: function() {
                return {
                    exec: promiseUtils.getResolveExactlyPromiseStub(testRes)
                };
            }};
            resSvc.getList(options).fin(done).then(function(ret) {
                //ret.args[0].should.equal(options.query);
                //ret.args[1].should.equal(options.select);
                ret.should.equal(testRes);
            }).fail(function(err) {
                throw err;
            }).done();
        });

        it('rejects when err returned from model.find', function (done) {
            var options = {
                query: 'anything',
                select: 'anything'
            };
            var randomErrString = testUtils.getRandomString(10);
            options.model = { find: function() {
                return {
                    exec: promiseUtils.getRejectExactlyPromiseStub(randomErrString)
                };
            }};

            resSvc.getList(options).fin(done).done(function () {
                throw new Error('Resolved but should have rejected');
            }, function (err) {
                err.toString().should.contain(randomErrString);
            });


        });

        it('rejects when resource is empty', function (done) {
            var options = {
                query: 'anything',
                select: 'anything'
            };
            options.model = { findOne: promiseUtils.getResolveNullPromiseStub()};
            resSvc.getList(options).fin(done)
                .then(function () {
                    throw new Error('Resolved but should have rejected');
                })
                .fail(function (err) {
                    err.toString().should.contain('No resource was returned');
                });
        });

    });

    describe('processDocumentSave', function() {

        it('builds the proper options list and calls save with it', function(done) {

            var params = { arg1: testUtils.getRandomString(10), arg2: testUtils.getRandomString(10) };
            var fn = function(opts) { opts.modded = 'modded'; return opts; };
            var options = { 'opt1' : testUtils.getRandomString(10) };
            resSvc.save = promiseUtils.getNoopPromiseStub();
            resSvc.processDocumentSave(params, fn, options).fin(done).then(function(ret) {
                var testObj = cb.extend(params, options);
                testObj.modded = 'modded';
                ret.args[0].opt1.should.equal(testObj.opt1);
                ret.args[0].arg1.should.equal(testObj.arg1);
                ret.args[0].arg2.should.equal(testObj.arg2);
                ret.args[0].modded.should.equal(testObj.modded);
            }).fail(function(err) {
                throw err;
            }).done();


        });

    });

    afterEach(function () {
        sandbox.restore();
    });

});