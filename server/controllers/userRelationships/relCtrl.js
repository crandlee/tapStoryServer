"use strict";
var cb = require('common-bundle')();
var _ = cb._;
var errSvc = cb.errSvc;
var userRelSvc = cb.rootRequire('svc-rel');
var linkSvc = cb.rootRequire('svc-link');
var userSvc = cb.rootRequire('svc-user');
var enums = cb.rootRequire('enums');
var ctrlHelper = cb.rootRequire('ctrl-helper');


function activateSubordinate(req, res, next) {

    var userName = (req.params && req.params.relUser);
    if (!userName)
        ctrlHelper.setBadRequest(res, 'Activating a subordinate requires a target relUser');

    userSvc.activate(userName)
        .then(_.partial(ctrlHelper.setOk, res))
        .fail(_.partial(ctrlHelper.setInternalError, res))
        .fin(next)
        .done();

}

function deactivateSubordinate(req, res, next) {

    var userName = (req.params && req.params.relUser);
    if (!userName)
        ctrlHelper.setBadRequest(res, 'Deactivating a subordinate requires a target relUser');

    userSvc.deactivate(userName)
        .then(_.partial(ctrlHelper.setOk, res))
        .fail(_.partial(ctrlHelper.setInternalError, res))
        .fin(next)
        .done();

}

function updateSubordinate(targetRel, req, res, next) {

    var sourceUserName = (req.params && req.params.userName);
    if (!sourceUserName)
        ctrlHelper.setBadRequest(res, 'Updating a subordinate requires a source userName');

    req.body.userName = req.params.relUser;
    saveSubordinate(req.body || {}, targetRel, { updateOnly: true })
        .then(function(userName) {
            if (!userName) {
                ctrlHelper.setInternalError(res, 'An unexpected error occurred. Subordinate save was not properly completed');
            } else {
                ctrlHelper.setOk(res);
            }
        })
        .fail(_.partial(ctrlHelper.setInternalError, res))
        .fin(next)
        .done();

}

function saveSubordinate(dataBody, targetRelationship, options) {

    options = options || {};
    if (targetRelationship === enums.relationships.child) dataBody.isMinor = true;
    return userSvc.save(dataBody, options)
        .then(function(user) {
            if (!user) errSvc.error("No subordinate user added", { userName: (dataBody && dataBody.userName)});
            return cb.Promise(user.userName);
        });

}

function saveRelationship(srcRel, targetRel, options, req, res, next) {

    options = options || {};
    var sourceUserName = (req.params && req.params.userName);
    var targetUserName = (req.body && req.body.userName);
    if (!sourceUserName)
        ctrlHelper.setBadRequest(res, 'Adding a relationship requires a source userName');
    if (!targetUserName && !options.addSubordinate)
        ctrlHelper.setBadRequest(res, 'Adding a relationship requires a target userName');
    if (!srcRel || typeof srcRel !== 'object')
        ctrlHelper.setBadRequest(res, 'Adding a relationship requires a source relationship');
    if (!targetRel || typeof targetRel !== 'object')
        ctrlHelper.setBadRequest(res, 'Adding a relationship requires a target relationship');

    //Allows a user to override operation for a subordinate
    if (req.params && req.params.relUser) sourceUserName = req.params.relUser;

    if (sourceUserName && targetUserName && srcRel && targetRel) {

        srcRel.user = sourceUserName;
        (options.addSubordinate ? saveSubordinate(req.body || {}, targetRel.rel, {addOnly: true}) : cb.Promise(targetUserName))
            .then(function(userName) {
                targetRel.user = userName;
                userRelSvc.saveRelationship(srcRel, targetRel, options)
                    .then(_.partial(ctrlHelper.setOk, res))
                    .fail(_.partial(ctrlHelper.setInternalError, res))
                    .fin(next)
                    .done();
            }).fail(_.partial(ctrlHelper.setInternalError, res));

    } else {
        return next();
    }
}


function getRelationships(relationship, req, res, next) {

    var userName = (req.params && req.params.userName);
    if (!userName)
        ctrlHelper.setBadRequest(res, 'Getting relationships requires a userName');

    //Allows a user to override operation for a subordinate
    if (req.params && req.params.relUser) userName = req.params.relUser;

    if (userName) {
        userRelSvc.getRelationships(userName, relationship, [enums.statuses.pending, enums.statuses.pendingack, enums.statuses.active])
            .then(function (rels) {
                rels = rels || [];
                var relsVm = rels.map(function(rel) {
                   return rel.viewModel('relationship', req.path(), { sourceName: userName });
                });
                relsVm = getRelationshipLinks(relationship, req, relsVm);
                ctrlHelper.setOk(res, relsVm);
            })
            .fail(_.partial(ctrlHelper.setInternalError, res))
            .fin(next)
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
    getRelationships: getRelationships,
    updateSubordinate: updateSubordinate,
    deactivateSubordinate: deactivateSubordinate,
    activateSubordinate: activateSubordinate
};