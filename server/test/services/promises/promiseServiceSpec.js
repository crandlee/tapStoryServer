"use strict";
require('require-enhanced')();

var sinon = require('sinon');
var should = require('chai').should();
var proxyquire = require('proxyquire');

describe('Services Tests', function () {
    describe('promises', function () {

        var promiseSvc;
        var sandbox;

        describe('promiseService.js', function () {

            beforeEach(function() {

                sandbox = sinon.sandbox.create();
                promiseSvc = proxyquire(global.getRoutePathFromKey('svc-promise'), {});

            });


            describe('createPromise', function() {

                it('adds the promiseObjects to the promiseCount', function() {
                    promiseSvc.promiseCount().should.equal(0);
                    var id1 = promiseSvc.createPromise();
                    promiseSvc.promiseCount().should.equal(1);
                    var id2 = promiseSvc.createPromise();
                    promiseSvc.promiseCount().should.equal(2);
                    should.exist(id1);
                    should.exist(id2);
                });

            });

            describe('getPromise', function() {

                it('should return promises from the list', function() {
                    promiseSvc.promiseCount().should.equal(0);
                    var id1 = promiseSvc.createPromise();
                    var id2 = promiseSvc.createPromise();
                    var promise = promiseSvc.getPromise(id1);
                    should.exist(promise);
                    var lastPromise = promiseSvc.getPromise(id2);
                    should.exist(lastPromise);
                    //Promise count should still equal 2 because no
                    //resolved/rejected
                    promiseSvc.promiseCount().should.equal(2);
                });

            });

            describe('resolve', function() {

                it('should resolve the returned promise and remove it from the stack', function(done) {
                    this.timeout(500);
                    promiseSvc.promiseCount().should.equal(0);
                    var id1 = promiseSvc.createPromise();
                    var id2 = promiseSvc.createPromise();
                    var promise = promiseSvc.getPromise(id2);
                    should.exist(promise);
                    var num = Math.random();
                    promiseSvc.resolve(num, id2);
                    promiseSvc.promiseCount().should.equal(1);
                    promise.then(function(val) {
                        val.should.equal(num);
                        done();
                    });
                });

            });

            describe('reject', function() {

                //Going to test the index with this one
                it('should reject the returned promise and remove it from the stack', function(done) {
                    this.timeout(500);
                    promiseSvc.promiseCount().should.equal(0);
                    var id1 = promiseSvc.createPromise();
                    var id2 = promiseSvc.createPromise();
                    var promise = promiseSvc.getPromise(id1);
                    should.exist(promise);
                    var num = Math.random();
                    promiseSvc.reject(num, id1);
                    promiseSvc.promiseCount().should.equal(1);
                    promise.fail(function(val) {
                        val.should.equal(num);
                        done();
                    });
                });

            });


            afterEach(function() {
                sandbox.restore();
            });

        });


    });
});
