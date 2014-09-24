"use strict";
var cb = require('common-bundle')();
var _ = cb._;
var errSvc = cb.errSvc;
var userRelSvc = cb.rootRequire('svc-rel');
var userSvc = cb.rootRequire('svc-user');
var enums = cb.rootRequire('enums');
var ctrlHelper = cb.rootRequire('ctrl-helper');


function activateSubordinate(req, res, next) {

    var userName = (req.params && req.params.relUser);
    if (!userName)
        ctrlHelper.setBadRequest(res, next, 'Activating a subordinate requires a target relUser');

    if (userName) {
        userSvc.activate(userName)
            .then(_.partial(ctrlHelper.setOk, res, next))
            .fail(_.partial(ctrlHelper.setInternalError, res, next))
            .done();
    }

}

function deactivateSubordinate(req, res, next) {

    var userName = (req.params && req.params.relUser);
    if (!userName)
        ctrlHelper.setBadRequest(res, next, 'Deactivating a subordinate requires a target relUser');

    userSvc.deactivate(userName)
        .then(_.partial(ctrlHelper.setOk, res, next))
        .fail(_.partial(ctrlHelper.setInternalError, res, next))
        .done();

}

function updateSubordinate(targetRel, req, res, next) {

    var sourceUserName = (req.params && req.params.userName);
    if (!sourceUserName)
        ctrlHelper.setBadRequest(res, next, 'Updating a subordinate requires a source userName');

    if (sourceUserName) {

        req.body.userName = req.params.relUser;
        saveSubordinate(req.body || {}, targetRel, { updateOnly: true })
            .then(function (user) {
                if (!user) {
                    ctrlHelper.setInternalError(res, next, 'An unexpected error occurred. Subordinate save was not properly completed');
                } else {
                    ctrlHelper.setOk(res, next);
                }
            })
            .fail(_.partial(ctrlHelper.setInternalError, res, next))
            .done();

    }
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

    var childName = (req.params && req.params.userName);
    var guardianName = (req.body && req.body.userName);
    if (!childName)
        ctrlHelper.setBadRequest(res, next, 'Adding an additional guardian requires a source child user name');
    if (!guardianName)
        ctrlHelper.setBadRequest(res, next, 'Adding an additional guardian requires a target guardian user name');

    if (childName && guardianName) {
        userRelSvc.saveRelationship(
            { rel: enums.relationships.child, status: enums.statuses.active, user: childName },
            { rel: enums.relationships.guardian, status: enums.statuses.active, user: guardianName },
            { })
            .then(_.partial(ctrlHelper.setOk, res, next))
            .fail(_.partial(ctrlHelper.setInternalError, res, next))
            .done();
    }
}

function saveRelationship(srcRel, targetRel, options, req, res, next) {

    var needsSubordinate = function (targetUser, srcRel) {
        if (srcRel.rel !== enums.relationships.guardian) return false;
        return !targetUser || targetUser.isMinor;
    };

    options = options || {};
    var sourceUserName = (req.params && req.params.userName);
    var targetUserName = (req.body && req.body.userName);
    if (!sourceUserName)
        ctrlHelper.setBadRequest(res, next, 'Modifying a relationship requires a source userName');
    if (!targetUserName)
        ctrlHelper.setBadRequest(res, next, 'Modifying a relationship requires a target userName');
    if (!srcRel || typeof srcRel !== 'object')
        ctrlHelper.setBadRequest(res, next, 'Modifying a relationship requires a source relationship type');
    if (!targetRel || typeof targetRel !== 'object')
        ctrlHelper.setBadRequest(res, next, 'Modifying a relationship requires a target relationship type');

    if (sourceUserName && targetUserName && srcRel && targetRel) {
        srcRel.user = sourceUserName;
        userSvc.getSingle(targetUserName)
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

    var userName = (req.params && req.params.userName);
    if (!userName)
        ctrlHelper.setBadRequest(res, next, 'Getting relationships requires a userName');

    //Allows a user to override operation for a subordinate
    if (req.params && req.params.relUser) userName = req.params.relUser;

    if (userName) {
        userRelSvc.getRelationships(userName, relationship, [enums.statuses.pending, enums.statuses.pendingack, enums.statuses.active])
            .then(function (rels) {
                ctrlHelper.setOk(res, next, rels.map(function (rel) {
                    return rel.viewModel('relationship', { sourceName: userName });
                }));
            })
            .fail(_.partial(ctrlHelper.setInternalError, res, next))
            .done();
    }

}

module.exports = {
    saveRelationship: saveRelationship,
    getRelationships: getRelationships,
    updateSubordinate: updateSubordinate,
    deactivateSubordinate: deactivateSubordinate,
    activateSubordinate: activateSubordinate,
    addAdditionalGuardian: addAdditionalGuardian
};