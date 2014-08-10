"use strict";
require('require-enhanced')();

var Q = require('q');
var uuid = require('node-uuid');
var functionUtils = global.rootRequire('util-function');
var _ = require('lodash');
var promiseObjects = [];
var internalId = null;


if (!internalId) internalId = uuid.v4();

//Wraps the promise library and keeps a stack of promise objects

function createPromise() {

    //Return the new id of the object
    return pushPromiseObject();

}

function pushPromiseObject() {

    var po = {
        promiseWrapper: Q.defer(),
        resolvedRejected: false,
        promiseReturned: false,
        id: uuid.v4()
    };
    promiseObjects.push(po);
    return po.id;

}

function resolve(val, id) {

    return completeAction(true, val, id);

}

function reject(val, id) {

    return completeAction(false, val, id);

}

function completeAction(toResolve, val, id) {

    var po = getPromiseObject(id);
    if (po) {
        po.resolvedRejected = true;
        if (toResolve) {
            po.promiseWrapper.resolve(val);
        } else {
            po.promiseWrapper.reject(val);
        }
        popPromiseObject(id);
        return true;
    }
    return false;

}


function getPromiseObjectIndex(id) {


    return _.findIndex(promiseObjects, function(po) {
        return po.id === id;
    });

}

function getPromiseObject(id) {

    var index = getPromiseObjectIndex(id);
    if (index > -1) {
        return promiseObjects[index];
    }
    return null;

}

function canPop(id) {

    var po = getPromiseObject(id);
    return (po && (po.resolvedRejected && po.promiseReturned));

}

function popPromiseObject(id, force) {


    var index = getPromiseObjectIndex(id);
    if (index > -1 && (canPop(id) || force)) {
        promiseObjects.splice(index, 1);
        return true;
    }
    return false;

}

function clearPromise(id) {

    popPromiseObject(id, true);

}

function getPromise(id) {

    var po = getPromiseObject(id);

    if (po) {
        po.promiseReturned = true;
        popPromiseObject(id);
    }
    return !!po ? po.promiseWrapper.promise : null;

}

function wrapWithPromise(fn, context) {

    //Begin a new promise and attach it to the function
    var id = createPromise();
    var options = {
        before: null,
        context: context,
        result: getPromise(id)
    };
    fn.resolvingWith = function (value) {
        options.after = function () {
            resolve(value, id);
        };
        return functionUtils.wrap(fn, options);
    };

    fn.rejectingWith = function (err) {
        options.after = function () {
            reject(err, id);
        };
        return functionUtils.wrap(fn, options);
    };

    return fn;
}


function makeEmptyPromise(sinonStub) {

    //For sinon stubs that just need to compile as a promise
    //and don't actually need to resolve/reject

    sinonStub.returns(Q.defer().promise);
    return sinonStub;
}

function getPromiseIdList() {
    return _.map(promiseObjects, function(po) {
       return po.id;
    });
}

function promiseCount() {
    return promiseObjects.length;
}

function promiseLib() {
    return Q;
}

function getServiceId() {
    return internalId;
}

module.exports = {
    createPromise: createPromise,
    resolve: resolve,
    reject: reject,
    getPromise: getPromise,
    promiseCount: promiseCount,
    clearPromise: clearPromise,
    getPromiseIdList: getPromiseIdList,
    wrapWithPromise: wrapWithPromise,
    makeEmptyPromise: makeEmptyPromise,
    promiseLib: promiseLib,
    getServiceId: getServiceId

};



