"use strict";
require('require-enhanced')();

var userRelSvc = global.rootRequire('svc-rel');

function saveRelationship(req, res, next) {

    var sourceUserName = (req.params && req.params.userName);
    var relUserName = (req.body && req.body.relUser);
    var relationship = (req.body && req.body.relationship);
    var relStatus = (req.body && req.body.relStatus);

    if (!sourceUserName) { res.status(400); res.end('Adding a relationship requires a sourceUser'); }
    if (!relUserName) { res.status(400); res.end('Adding a relationship requires a relUser'); }
    if (!relationship) { res.status(400); res.end('Adding a relationship requires a relationship'); }

    if (sourceUserName && relUserName && relationship) {
        userRelSvc.saveRelationship(sourceUserName, relUserName, relationship, { relStatus: relStatus })
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
        return next();
    }
}

function getRelationships(req, res, next) {

    //TODO-Randy: How to authorize this action?

    var userName = (req.params && req.params.userName);
    if (!userName) { res.status(400); res.end('Getting relationships requires a userName'); }
    if (userName) {
        userRelSvc.getRelationships(userName)
            .then(function (rels) {
                if (!rels) {
                    res.status(404);
                    res.end('Cannot find relationships for this user');
                } else {
                    var relsVm = rels.map(function(rel) {
                       return rel.viewModel('relationship', req.path());
                    });
//                    var roles = linkSvc.attachLinksToObject({ roles: user.roles },
//                        [{ uri: '', rel: 'role', method: 'POST'}, { uri: '', rel: 'role', method: 'DELETE'}],
//                        req.path());
                    //TODO-Randy: ViewModels/Links
                    res.send(200, { relationships: relsVm });
                }
            })
            .fail(function (err) {
                res.status(500);
                res.end(err.message);
            })
            .fin(function() { return next(); })
            .done();

    } else {
        return next();
    }

}

module.exports = {
    saveRelationship: saveRelationship,
    getRelationships: getRelationships
};