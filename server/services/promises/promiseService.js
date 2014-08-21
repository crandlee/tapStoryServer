"use strict";
require('require-enhanced')();

var Q = require('q');
var uuid = require('node-uuid');
var functionUtils = global.rootRequire('util-function');
var _ = require('lodash');
var promiseObjects = [];

//Wraps the promise library and keeps a stack of promise objects

function createPromise(options) {

    //An externalPromise (pid) indicates that a promise has been previously
    //created by another function up the chain and will therefore be
    //managed by that function.  In this case, we only return the existing pid
    //instead of creating a new one.
    if (options && options.externalPromise) return options.externalPromise;

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

function clearPromise(id, options) {

    //Do nothing if externalPromise has been set.  This means the
    //calling function does not have this authority.
    if (options && options.externalPromise) return null;

    popPromiseObject(id, true);

}

function getPromise(id, options) {

    //peekPromise allows you to get the promise without potentially removing it
    //from the stack as if it were legitimately returned.  This indicates that the
    //caller intends to do another get promise later where this option is not set.
    var peekPromise = (options && options.peekPromise) || false;

    //Return nothing when externalPromise is set.  This indicates that the caller
    //is not responsible for the promise and thus does not have the 'authority'
    //to do anything with it.
    if (options && options.externalPromise) return null;

    var po = getPromiseObject(id);

    if (po && !peekPromise) {
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
    promiseLib: promiseLib

};



