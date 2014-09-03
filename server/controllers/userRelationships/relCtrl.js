"use strict";
require('require-enhanced')();

var userRelSvc = global.rootRequire('svc-rel');

function saveRelationship(req, res, next) {

    //TODO: How to authorize this action?

    var sourceUserName = (req.params && req.params.userName);
    var relUserName = (req.body && req.body.relUser);
    var relationship = (req.body && req.body.relationship);

    if (sourceUserName && relUserName && relationship) {
        userRelSvc.saveRelationship(sourceUserName, relUserName, relationship)
            .then(function () {
                res.status(200);
                res.end();
            })
            .fail(function (err) {
                res.status(500);
                res.end(err.message);
            })
            .fin(next)
            .done();
    } else {
        res.status(400);
        res.end('Posting a relationship requires a relUser and relationship');
        next();
    }
}

module.exports = {
    saveRelationship: saveRelationship
};