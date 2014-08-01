var redis = require('redis');
var promiseSvc = require('../promises/promiseService');

var client;

function setKey(key, val) {

    startupClientConnection();
    console.log(val);
    client.set(key, val);
    closeClientConnection();

}

function getKey(key) {

    var pid = promiseSvc.createPromise();

    startupClientConnection();

    client.get(key, function(err, reply) {

        if (err) promiseSvc.reject(err, pid);
        if (!reply)
            promiseSvc.reject('Key ' + key + ' not found in collection.', pid);
        else
            promiseSvc.resolve(reply, pid);

    });

    closeClientConnection();

    return promiseSvc.getPromise(pid);
}

function startupClientConnection() {

    client = redis.createClient();
    client.on("error", function (err) {
        console.log("Redis error: " + err);
    });

}

function closeClientConnection() {

    if (client) client.quit();

}

module.exports = {
  setKey: setKey,
  getKey: getKey
};
