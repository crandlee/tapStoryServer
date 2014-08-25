"use strict";
require('require-enhanced')();

var functionUtils = global.rootRequire('util-function');

function wrapWithPromise(fn, context) {

    return (function() {

        //Begin a new promise and attach it to the function
        var dfr = global.Promise.defer();

        var options = {
            before: null,
            context: context,
            result: dfr.promise
        };
        fn.resolvingWith = function (value, exactlyValue) {
            options.after = function () {
                var args = Array.prototype.slice.call(arguments);
                dfr.resolve(function() {
                    if(exactlyValue) {
                        if (typeof value === 'object' || typeof value === 'function') {
                            //Can still use the extended properties if this is an object or function / not for 'value' types
                            return global.extend(true, value, makePromiseReturnVal(args, value));
                        } else {
                            return value;
                        }
                    } else {
                        return makePromiseReturnVal(args, value);
                    }
                }());
            };
            return functionUtils.wrap(fn, options);
        };

        fn.noop = function() {
            options.after = function () {
                dfr.resolve(makePromiseReturnVal(Array.prototype.slice.call(arguments), null));
            };
            return functionUtils.wrap(fn, options);
        };


        fn.realNull = function() {
            options.after = function () {
                dfr.resolve(null);
            };
            return functionUtils.wrap(fn, options);
        };


        fn.rejectingWith = function (err, exactlyErr, serverInternalCode) {
            options.after = function () {
                dfr.reject(
                    (function(internal) {
                        var thisErr =  exactlyErr ? new Error(err) :
                            new Error(JSON.stringify(makePromiseReturnVal(Array.prototype.slice.call(arguments), err)));
                        if (internal) thisErr.serverInternalCode = internal;
                        return thisErr;
                    }(serverInternalCode))
                );
            };
            return functionUtils.wrap(fn, options);
        };

        return fn;

    }(fn, context, Array.prototype.slice.call(arguments, 2)));
}

function makePromiseReturnVal(args, val) {
    return {
        returned: val,
        args: args
    };

}

function makeEmptyPromise(sinonStub) {

    //For sinon stubs that just need to compile as a promise
    //and don't actually need to resolve/reject
    sinonStub.returns(global.Promise.defer().promise);
    return sinonStub;

}

function deNodeify(fn) {

    //This function will run Q's denodeify unless it
    //has been wrapped in a promise via the wrapPromise function
    //in this case it will be assumed to be stubbed
    if (fn && fn.isWrappedPromise) return fn;
    return global.Promise.denodeify(fn);

}


function getResolveNullPromiseStub(context) {

    return wrapWithPromise(createStubPartial(context))
        .realNull();

}


function getResolveExactlyPromiseStub(resolvingWith, context) {

    var args = Array.prototype.slice.call(arguments, 2);
    return wrapWithPromise(createStubPartial(context, args))
        .resolvingWith(resolvingWith, true);

}

function getResolvingPromiseStub(resolvingWith, context) {

    var args = Array.prototype.slice.call(arguments, 2);
    return wrapWithPromise(createStubPartial(context, args))
        .resolvingWith(resolvingWith);

}

function getRejectingPromiseStub(rejectingWith, context, serverInternalCode) {

    var args = Array.prototype.slice.call(arguments, 3);
    return wrapWithPromise(createStubPartial(context, args))
        .rejectingWith(rejectingWith, false, serverInternalCode);

}

function getRejectExactlyPromiseStub(rejectingWith, context, serverInternalCode) {

    var args = Array.prototype.slice.call(arguments, 3);
    return wrapWithPromise(createStubPartial(context, args))
        .rejectingWith(rejectingWith, true, serverInternalCode);

}

function getNoopPromiseStub(context) {

    var args = Array.prototype.slice.call(arguments, 1);
    return wrapWithPromise(createStubPartial(context, args))
        .noop();

}

function createStubPartial(context, args) {

    return function() {
        var stub = function() {};
        return stub.apply(context, args);
    };
}

module.exports = {
    wrapWithPromise: wrapWithPromise,
    makeEmptyPromise: makeEmptyPromise,
    deNodeify: deNodeify,
    getResolvingPromiseStub: getResolvingPromiseStub,
    getRejectingPromiseStub: getRejectingPromiseStub,
    getResolveNullPromiseStub: getResolveNullPromiseStub,
    getNoopPromiseStub: getNoopPromiseStub,
    getResolveExactlyPromiseStub: getResolveExactlyPromiseStub,
    getRejectExactlyPromiseStub: getRejectExactlyPromiseStub
};



