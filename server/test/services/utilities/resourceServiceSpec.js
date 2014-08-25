"use strict";
require('require-enhanced')({ test: true });

describe('services/utilities/resourceService', function () {

    var sinon = global.sinon, sandbox;
    var resSvc, mongooseStub;

    beforeEach(function () {

        global.errSvc.bypassLogger(true);
        sandbox = sinon.sandbox.create();
        mongooseStub = sandbox.stub({
            model: function () {

            }
        });
        resSvc = global.proxyquire(global.getRoutePathFromKey('svc-resource'),
            { mongoose: mongooseStub });

    });

    describe('_getModelFromOptions', function () {

        it('returns the model from mongoose', function () {

            var modelName = global.testUtils.getRandomString(10);
            var testRet = { testObject: global.testUtils.getRandomString(10) };
            var options = { modelName: modelName };
            mongooseStub.model.returns(testRet);
            var model = resSvc._getModelFromOptions(options);
            sinon.assert.calledWithExactly(mongooseStub.model, modelName);
            global.should.exist(model);
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
                preValidation: global.Promise.fbind(function(opts) { return opts; }),
                onNew: { roles: 'user', _id: global.testUtils.getRandomString(10) },
                modelName: 'User',
                singleSearch: { userName: 'test' },
                mapPropertiesToResource: global.Promise.fbind(function(resource) { return resource; })
            };
        }

        it('fails when singleSearch is not set on the options input', function(done) {
            var options = {
                singleSearch: null,
                mapPropertiesToResource: function() {},
                model: {}
            };
            var checkRejection = function(err) {
                global.should.exist(err);
                err.toString().should.contain('No search criteria');
            };
            resSvc.save(options).fail(checkRejection).fin(done).done();
        });

        it('fails when mapPropertiesToResource is not set on the options input', function(done) {
            var options = {
                singleSearch: {},
                mapPropertiesToResource: null,
                model: {}
            };
            var checkRejection = function(err) {
                global.should.exist(err);
                err.toString().should.contain('Missing map function');
            };
            resSvc.save(options).fail(checkRejection).fin(done).done();
        });

        it('calls findOne on the model to check for existing resource', function(done) {

            var opts = getServiceOptionsStub();

            opts.model = { findOne: global.promiseUtils.getNoopPromiseStub() };
            opts.addResourceStub = function(opts) {};
            opts.updateResourceStub = function(opts, resource) { return resource; };
            resSvc.save(opts).fin(done).then(function(ret) {
                ret.args[0].should.equal(opts.singleSearch);
            }).fail(function(err) {
                throw err;
            })
            .done();

        });

        it('throws an error when the call to findOne rejects', function(done) {

            var opts = getServiceOptionsStub();
            var testError = global.testUtils.getRandomString(20);

            opts.model = { findOne: global.promiseUtils.getRejectingPromiseStub(testError) };
            resSvc.save(opts).fin(done).then(function() {
                throw new Error('Resolved when it should have rejected');
            }).fail(function(err) {
                err.message.should.contain(testError);
            }).done();

        });

        it('it rejects when trying to add with updateOnly option', function(done) {

            var opts = getServiceOptionsStub();

            opts.model = { findOne: global.promiseUtils.getResolveNullPromiseStub() };
            opts.updateOnly = true;

            resSvc.save(opts).fin(done).then(function() {
                throw new Error('Resolved when it should have rejected');
            }).fail(function(err) {
                err.message.should.contain('Can only update');
            }).done();

        });

        it('throws an error when model.create fails', function(done) {

            var opts = getServiceOptionsStub();
            var testError = global.testUtils.getRandomString(10);
            opts.model = {
                findOne: global.promiseUtils.getResolveNullPromiseStub(),
                create: global.promiseUtils.getRejectExactlyPromiseStub(testError)
            };
            resSvc.save(opts).fin(done).then(function() {
                throw new Error('Resolved when it should have rejected');
            }).fail(function(err) {
                err.message.should.contain(testError);
            }).done();

        });

        it('returns a resource when the return value from model.create is valid and has in _id', function(done) {

            var opts = getServiceOptionsStub();

            opts.model = {
                findOne: global.promiseUtils.getResolveNullPromiseStub(),
                create: global.promiseUtils.getResolveExactlyPromiseStub(opts.onNew)
            };
            resSvc.save(opts).fin(done).then(function(ret) {
                ret.should.equal(opts.onNew);
            }).fail(function(err) {
                throw err;
            }).done();

        });


        it('it rejects when trying to update with addOnly option', function(done) {

            var opts = getServiceOptionsStub();

            opts.model = { findOne: global.promiseUtils.getResolveExactlyPromiseStub(opts.onNew) };
            opts.addOnly = true;

            resSvc.save(opts).fin(done).then(function() {
                throw new Error('Resolved when it should have rejected');
            }).fail(function(err) {
                err.message.should.contain('Can only create');
            }).done();

        });

        it.only('throws an error when model.save fails', function(done) {

            var opts = getServiceOptionsStub();
            var testError = global.testUtils.getRandomString(10);
            opts.onNew.save = global.promiseUtils.getRejectExactlyPromiseStub(testError);
            opts.model = {
                findOne: global.promiseUtils.getResolveExactlyPromiseStub(opts.onNew)
            };
            resSvc.save(opts).fin(done).then(function() {
                throw new Error('Resolved when it should have rejected');
            }).fail(function(err) {
                err.message.should.contain(testError);
            }).done();

        });

        it('returns a resource when the call to model.save returns a resource', function(done) {

            var opts = getServiceOptionsStub();

            opts.onNew.save = global.promiseUtils.getResolveExactlyPromiseStub(opts.onNew);
            opts.model = {
                findOne: global.promiseUtils.getResolveExactlyPromiseStub(opts.onNew)
            };
            resSvc.save(opts).fin(done).then(function(ret) {
                ret.should.equal(opts.onNew);
            }).fail(function(err) {
                throw err;
            }).done();

        });

    });

    describe('getSingle', function () {

        it('rejects when query not passed in', function (done) {
            var options = {
                query: null,
                select: global.testUtils.getRandomString(10),
                model: {}
            };
            var checkRejection = function(err) {
                global.should.exist(err);
                err.toString().should.contain('No query provided');
            };
            resSvc.getSingle(options).fail(checkRejection).done(done, done);
        });

        it('calls model.findOne with query and select', function (done) {

            var options = {
                query: global.testUtils.getRandomString(10),
                select: global.testUtils.getRandomString(10)
            };

            options.model = { findOne: global.promiseUtils.getNoopPromiseStub() };
            resSvc.getSingle(options).fin(done).then(function(ret) {
                ret.args[0].should.equal(options.query);
                ret.args[1].should.equal(options.select);
            }).fail(function(err) {
                throw err;
            }).done();

        });

        it('returns a promise that resolves to a resource when found', function (done) {
            var testResource = { id: global.testUtils.getRandomString(10)};
            var options = {
                query: 'anything',
                select: 'anything'
            };
            options.model = { findOne: global.promiseUtils.getResolvingPromiseStub(testResource)};
            resSvc.getSingle(options).fin(done).done(function (resource) {
                resource.returned.should.equal(testResource);
            }, function () {
                throw new Error('Rejected but should have resolved');
            });

        });

        it('rejects when err returned from model.findOne', function (done) {
            var options = {
                query: 'anything',
                select: 'anything'
            };
            var randomErrString = global.testUtils.getRandomString(10);
            options.model = { findOne: global.promiseUtils.getRejectingPromiseStub(randomErrString)};
            resSvc.getSingle(options).fin(done).done(function () {
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
            options.model = { findOne: global.promiseUtils.getResolveNullPromiseStub()};
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
                select: global.testUtils.getRandomString(10),
                model: {}
            };
            var checkRejection = function(err) {
                global.should.exist(err);
                err.toString().should.contain('No query provided');
            };
            resSvc.getList(options).fail(checkRejection).done(done, done);
        });


        it('calls model.find with query and select', function (done) {

            var options = {
                query: global.testUtils.getRandomString(10),
                select: global.testUtils.getRandomString(10)
            };

            options.model = { find: global.promiseUtils.getNoopPromiseStub() };
            resSvc.getList(options).fin(done).then(function(ret) {
                ret.args[0].should.equal(options.query);
                ret.args[1].should.equal(options.select);
            }).fail(function(err) {
                throw err;
            }).done();
        });

        it('returns a promise that resolves to a an array of resources when found', function (done) {
            var testResources = [{ id: global.testUtils.getRandomString(10)}];
            var options = {
                query: 'anything',
                select: 'anything'
            };
            options.model = { find: global.promiseUtils.getResolvingPromiseStub(testResources)};
            resSvc.getList(options).fin(done).done(function (resource) {
                resource.returned.should.equal(testResources);
            }, function () {
                throw new Error('Rejected but should have resolved');
            });

        });

        it('rejects when err returned from model.find', function (done) {
            var options = {
                query: 'anything',
                select: 'anything'
            };
            var randomErrString = global.testUtils.getRandomString(10);
            options.model = { find: global.promiseUtils.getRejectingPromiseStub(randomErrString)};
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
            options.model = { findOne: global.promiseUtils.getResolveNullPromiseStub()};
            resSvc.getList(options).fin(done)
                .then(function () {
                    throw new Error('Resolved but should have rejected');
                })
                .fail(function (err) {
                    err.toString().should.contain('No resource was returned');
                });
        });

    });

    describe('processResourceSave', function() {

        it('builds the proper options list and calls save with it', function(done) {

            var params = { arg1: global.testUtils.getRandomString(10), arg2: global.testUtils.getRandomString(10) };
            var fn = function(opts) { opts.modded = 'modded'; return opts; };
            var options = { 'opt1' : global.testUtils.getRandomString(10) };
            resSvc.save = global.promiseUtils.getNoopPromiseStub();
            resSvc.processResourceSave(params, fn, options).fin(done).then(function(ret) {
                var testObj = global.extend(params, options);
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