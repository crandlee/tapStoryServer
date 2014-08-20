require('require-enhanced')();

var redis = require('redis');
var promiseSvc = global.rootRequire('svc-promise');
var extend = require('extend');
var client = redis.createClient();
var async = require('async');

client.on("error", function (err) {
    console.log("Redis error: " + err);
});


function setKey(key, val) {

    var pid = promiseSvc.createPromise();
    client.set(key, val, function(err, reply) {
        if (err)
            promiseSvc.reject(err, pid);
        else
            promiseSvc.resolve(reply, pid);
    });
    return promiseSvc.getPromise(pid);

}

function setExpires(key, seconds) {

    client.expire(key, seconds);

}


function getKey(key) {

    var pid = promiseSvc.createPromise();
    client.get(key, function(err, reply) {

        if (err) promiseSvc.reject(err, pid);
        if (!reply)
            promiseSvc.reject('Key ' + key + ' not found in collection.', pid);
        else
            promiseSvc.resolve(reply, pid);

    });
    return promiseSvc.getPromise(pid);
}


function updateFromArray(array, options){

    //TODO-Randy: Needs Test

    function addArray(array, options) {

        async.each(array, function(item, callback) {
            if (item.k && item.v) {
                client.set(options.withPrefix + item.k, item.v, function(err) {
                    if (err) throw new Error(err);
                    console.log('Added ' + (options.withPrefix + item.k));
                    callback();
                });
            } else {
                throw new Error('Item ' + item + ' needs both a "k" and "v" property for key and value');
            }
        }, function(err) {
            if (err)
                promiseSvc.reject(err, pid);
            else
                promiseSvc.resolve(null, pid);
        });

    }

    extend({
        withPrefix: '',
        deletePrefixFirst: false
    }, options);

    var pid = promiseSvc.createPromise();
    if (!Array.isArray(array)) promiseSvc.reject("First parameter must be a valid array", pid);

    if (options.withPrefix && options.deletePrefixFirst) {
        deleteKeysWithPrefix(options.withPrefix)
            .then(function() { addArray(array, options); });
    } else {
        addArray(array, options);
    }

    return promiseSvc.getPromise(pid);

}

function deleteKeysWithPrefix(prefix) {

    //TODO-Randy: Needs Test

    var pid = promiseSvc.createPromise();
    client.keys(prefix + '*', function(err, rows) {

        if (err)
            promiseSvc.reject(err, pid);
        else
            async.each(rows, function(row, callback) {
                client.del(row, callback);
            }, function(err) {
                if (err)
                    promiseSvc.reject(err, pid);
                else
                    promiseSvc.resolve(null, pid);
            });

    });
    return promiseSvc.getPromise(pid);

}

module.exports = {
  setKey: setKey,
  getKey: getKey,
  updateFromArray: updateFromArray,
  setExpires: setExpires
};
