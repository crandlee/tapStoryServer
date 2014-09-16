"use strict";
var cb = require('common-bundle')();
var _ = cb._;
var errSvc = cb.errSvc;
var userRelSvc = cb.rootRequire('svc-rel');
var linkSvc = cb.rootRequire('svc-link');
var userSvc = cb.rootRequire('svc-user');
var enums = cb.rootRequire('enums');

function saveRelationship(srcRel, targetRel, options, req, res, next) {

    options = options || {};
    var sourceUserName = (req.params && req.params.userName);
    var targetUserName = (req.body && req.body.userName);

    var saveNewSubordinate = function(dataBody) {
        return userSvc.save({addOnly: addOnly}, dataBody)
            .then(function(user) {
                if (!user) errSvc.error("No subordinate user added", { userName: (dataBody && dataBody.userName)});
                return user.userName;
            });
    };

    if (!sourceUserName) { res.status(400); res.end('Adding a relationship requires a source userName'); }
    if (!targetUserName && !options.addSubordinate)
        { res.status(400); res.end('Adding a relationship requires a target userName'); }
    if (!srcRel || typeof srcRel !== 'object')
        { res.status(400); res.end('Adding a relationship requires a source relationship'); }
    if (!targetRel || typeof targetRel !== 'object')
        { res.status(400); res.end('Adding a relationship requires a target relationship'); }

    if (sourceUserName && targetUserName && srcRel && targetRel) {

        srcRel.user = sourceUserName;
        (options.addSubordinate ? saveNewSubordinate(req.body || {}) : cb.Promise(targetUserName))
            .then(function(userName) {
                targetRel.user = userName;
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
            });

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
                relsVm = getRelationshipLinks(relationship, req, relsVm);
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

function getRelationshipLinks(relationship, req, relsVm) {
    switch (relationship) {
        case enums.relationships.friend:
            return linkSvc.attachLinksToObject({ relationships: relsVm },
                [
                    { uri: '', method: 'POST', rel: 'friendship' },
                    { uri: '', method: 'DELETE', rel: 'friendship' },
                    { uri: '/acknowledgement', method: 'POST', rel: 'acknowledgement' }
                ],
                req.path());
        case enums.relationships.guardian:
            return linkSvc.attachLinksToObject({ relationships: relsVm },
                [
                    { uri: '', method: 'POST', rel: 'guardianship' },
                    { uri: '', method: 'DELETE', rel: 'guardianship' }
                ],
                req.path());
    }

}

module.exports = {
    saveRelationship: saveRelationship,
    getRelationships: getRelationships
};