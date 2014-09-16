"use strict";
var cb = require('common-bundle')();
var _ = cb._;
var errSvc = cb.errSvc;
var userRelSvc = cb.rootRequire('svc-rel');
var linkSvc = cb.rootRequire('svc-link');

function saveRelationship(srcRel, targetRel, options, req, res, next) {

    var sourceUserName = (req.params && req.params.userName);
    var targetUserName = (req.body && req.body.userName);

    if (!sourceUserName) { res.status(400); res.end('Adding a relationship requires a source userName'); }
    if (!targetUserName) { res.status(400); res.end('Adding a relationship requires a target userName'); }
    if (!srcRel || typeof srcRel !== 'object')
        { res.status(400); res.end('Adding a relationship requires a source relationship'); }
    if (!targetRel || typeof targetRel !== 'object')
        { res.status(400); res.end('Adding a relationship requires a target relationship'); }

    if (sourceUserName && targetUserName && srcRel && targetRel) {

        srcRel.user = sourceUserName;
        targetRel.user = targetUserName;

        userRelSvc.saveRelationship(srcRel, targetRel, options)
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

function getRelationships(relationship, req, res, next) {

    var userName = (req.params && req.params.userName);
    if (!userName) { res.status(400); res.end('Getting relationships requires a userName'); }

    if (userName) {
        userRelSvc.getRelationships(userName, relationship, ['pending', 'pendingack', 'active'])
            .then(function (rels) {
                rels = rels || [];
                var relsVm = rels.map(function(rel) {
                   return rel.viewModel('relationship', req.path(), { sourceName: userName });
                });
                relsVm = linkSvc.attachLinksToObject({ relationships: relsVm },
                        [
                            { uri: '', method: 'POST', rel: 'friendship' },
                            { uri: '', method: 'DELETE', rel: 'friendship' },
                            { uri: '/acknowledgement', method: 'POST', rel: 'acknowledgement' }
                        ],
                        req.path());
                res.send(200, relsVm );
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