"use strict";
var cb = require('common-bundle')();
var _ = cb._;
var errSvc = cb.errSvc;
var userRelSvc = cb.rootRequire('svc-rel');
var userSvc = cb.rootRequire('svc-user');
var enums = cb.rootRequire('enums');
var ctrlHelper = cb.rootRequire('ctrl-helper');


function activateSubordinate(req, res, next) {

    userSvc.activate(req.params.userName)
        .then(_.partial(ctrlHelper.setOk, res, next))
        .fail(_.partial(ctrlHelper.setInternalError, res, next))
        .done();

}

function deactivateSubordinate(req, res, next) {

    userSvc.deactivate(req.params.userName)
        .then(_.partial(ctrlHelper.setOk, res, next))
        .fail(_.partial(ctrlHelper.setInternalError, res, next))
        .done();

}


function saveSubordinate(dataBody, targetRelationship, options) {

    options = options || {};
    if (targetRelationship === enums.relationships.child) dataBody.isMinor = true;
    return userSvc.save(dataBody, options)
        .then(function (user) {
            if (!user) errSvc.error("No subordinate user added", { userName: (dataBody && dataBody.userName)});
            return cb.Promise(user);
        });

}

function addAdditionalGuardian(req, res, next) {

    userRelSvc.saveRelationship(
        { rel: enums.relationships.child, status: enums.statuses.active, user: req.param.userName },
        { rel: enums.relationships.guardian, status: enums.statuses.active, user: req.body['guardianUserName'] },
        { })
        .then(_.partial(ctrlHelper.setOk, res, next))
        .fail(_.partial(ctrlHelper.setInternalError, res, next))
        .done();

}

function saveRelationship(srcRel, targetRel, options, req, res, next) {

    var needsSubordinate = function (targetUser, srcRel) {
        if (srcRel.rel !== enums.relationships.guardian) return false;
        return !targetUser || targetUser.isMinor;
    };

    options = options || {};
    if (!srcRel || typeof srcRel !== 'object')
        ctrlHelper.setBadRequest(res, next, 'Modifying a relationship requires a source relationship type');
    if (!targetRel || typeof targetRel !== 'object')
        ctrlHelper.setBadRequest(res, next, 'Modifying a relationship requires a target relationship type');

    if (srcRel && targetRel) {
        srcRel.user = req.params.userName;
        userSvc.getSingle(req.body.userName)
            .then(function (targetUser) {
                (needsSubordinate(targetUser, srcRel)
                    ? saveSubordinate(req.body || {}, targetRel.rel, {addOnly: true})
                    : cb.Promise(targetUser))
                    .then(function (user) {
                        if (!user)  {
                            ctrlHelper.setBadRequest(res, next, 'Target user does not exist or is inactive');
                        } else {
                            targetRel.user = user.userName;
                            userRelSvc.saveRelationship(srcRel, targetRel, options)
                                .then(_.partial(ctrlHelper.setOk, res, next))
                                .fail(_.partial(ctrlHelper.setInternalError, res, next))
                        }
                    }).fail(_.partial(ctrlHelper.setInternalError, res, next));
            })
            .done();
    }
}


function getRelationships(relationship, req, res, next) {

    userRelSvc.getRelationships(req.params.userName, relationship, [enums.statuses.pending, enums.statuses.pendingack, enums.statuses.active])
        .then(function (rels) {
            ctrlHelper.setOk(res, next, rels.map(function (rel) {
                return rel.viewModel('relationship', { sourceName: req.params.userName });
            }));
        })
        .fail(_.partial(ctrlHelper.setInternalError, res, next))
        .done();

}

module.exports = {
    saveRelationship: saveRelationship,
    getRelationships: getRelationships,
    deactivateSubordinate: deactivateSubordinate,
    activateSubordinate: activateSubordinate,
    addAdditionalGuardian: addAdditionalGuardian
};