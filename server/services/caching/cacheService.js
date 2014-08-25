require('require-enhanced')();

var redis = require('redis');
var client = redis.createClient();
//var async = require('async');

client.on("error", function (err) {
    console.log("Redis error: " + err);
});


function setKey(key, val) {
    return Q.denodeify(client.set)(key, val);
}

function setExpires(key, seconds) {
    client.expire(key, seconds);
}

function getKey(key) {
    return Q.denodeify(client.get)(key);
}

//function updateFromArray(array, options){
//
//
//    function addArray(array, options) {
//
//        async.each(array, function(item, callback) {
//            if (item.k && item.v) {
//                client.set(options.withPrefix + item.k, item.v, function(err) {
//                    if (err) throw new Error(err);
//                    callback();
//                });
//            } else {
//                throw new Error('Item ' + item + ' needs both a "k" and "v" property for key and value');
//            }
//        }, function(err) {
//            if (err)
//                promiseSvc.reject(err, pid);
//            else
//                promiseSvc.resolve(null, pid);
//        });
//
//    }
//
//    extend({
//        withPrefix: '',
//        deletePrefixFirst: false
//    }, options);
//
//    var pid = promiseSvc.createPromise();
//    if (!Array.isArray(array)) promiseSvc.reject("First parameter must be a valid array", pid);
//
//    if (options.withPrefix && options.deletePrefixFirst) {
//        deleteKeysWithPrefix(options.withPrefix)
//            .then(function() { addArray(array, options); });
//    } else {
//        addArray(array, options);
//    }
//
//    return promiseSvc.getPromise(pid);
//
//}
//
//function deleteKeysWithPrefix(prefix) {
//
//
//    var pid = promiseSvc.createPromise();
//    client.keys(prefix + '*', function(err, rows) {
//
//        if (err)
//            promiseSvc.reject(err, pid);
//        else
//            async.each(rows, function(row, callback) {
//                client.del(row, callback);
//            }, function(err) {
//                if (err)
//                    promiseSvc.reject(err, pid);
//                else
//                    promiseSvc.resolve(null, pid);
//            });
//
//    });
//    return promiseSvc.getPromise(pid);
//
//}

module.exports = {
  setKey: setKey,
  getKey: getKey,
  setExpires: setExpires
};
