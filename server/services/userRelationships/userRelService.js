'use strict';
var cb = require('common-bundle')();
var _ = cb._;
var errSvc = cb.errSvc;
var promise = cb.Promise;

var resSvc = cb.rootRequire('svc-resource');
var relSvcOptions = cb.rootRequire('svc-opts-rel');
var enums = cb.enums;

function saveRelationship(sourceRel, targetRel, options) {

    return resSvc.processDocumentSave({ participants: [sourceRel, targetRel] },
        relSvcOptions.setSaveRelationshipOptions, options);

}

function getRelationships(sourceUser, relationship, statuses) {
    var userSvc = cb.rootRequire('svc-user');
    return userSvc.getSingle(sourceUser)
        .then(function(user) {
            if (!user) errSvc.error('Could not find user to get relationships', { userName: sourceUser });
            var find = { "participants.user" : user._id };
            if (relationship) find = cb.extend(find, { "participants.rel" : relationship });
            if (statuses && !Array.isArray(statuses)) statuses = [statuses];
            if (statuses) find = cb.extend(find, { "participants.status" : { $in: statuses }});
            return resSvc.getList({ find: find, populate: ['participants.user'], model: 'UserRelationship'  })
                .then(function(relationships) {
                    return _.filter(relationships, function(rel) {
                        return rel.participants[0].user.isActive && rel.participants[1].user.isActive;
                    });
                });
        });

}

function getRelationship(userNames, options) {
    var userSvc = cb.rootRequire('svc-user');
    var getUser = function (userName, options) {
        return userSvc.getSingle(userName, options);
    };
    if (userNames && Array.isArray(userNames) && userNames.length === 2 && userNames[0] && userNames[1]) {
        return promise.all([getUser(userNames[0], options), getUser(userNames[1], options)])
            .then(function (users) {
                if (users && Array.isArray(users) && users.length === 2) {
                    if (!users[0] || !users[1]) return cb.Promise(null);
                    var find = { "participants.user" : { $all : [ users[0]._id, users[1]._id] } };
                    return resSvc.getSingle({ find: find, model: 'UserRelationship'  });
                } else {
                    errSvc.error('Unable to retrieve users for relationship', { userNames: userNames });
                }
            })
    } else {
        errSvc.error('Expected array of userNames', { userNames: userNames });
    }
}

function getRelKey(userNames) {

    if (!userNames || !Array.isArray(userNames) || userNames.length !== 2)
        errSvc.error('Must include two user names for this operation', { userNames: userNames });

    return _.chain(userNames)
        .map(function(str) { return str.toLowerCase() })
        .sortBy(function(str) { return str })
        .reduce(function(existing, single) { return existing + '||' + single.toLowerCase() })
        .value();

}

function canViewRelationshipUser(sourceUserName, relUserName) {
    return getRelationship([sourceUserName, relUserName])
        .then(function(relationship) {
            return (relationship && relationship.participants[0].status === 'active' && relationship.participants[1].status === 'active');
        });
}

function isRelated(relTypes, sourceUserName, targetUserName, options) {
    options = options || {};
    var isValidRelationshipType = function (rel, arrOfTypes) {
        if (rel && rel.participants && rel.participants.length === 2) {
            return _.every(rel.participants, function (p) {
                return (p.status && p.status === cb.enums.statuses.active) &&
                    (p.rel && _.indexOf(arrOfTypes, p.rel) > -1);
            });
        }
    };

    var getRelOpts = (options.allowInactive ? { allowInactive: true } : {});
    if (!relTypes) relTypes = _.values(cb.enums.relationships);
    return getRelationship([sourceUserName, targetUserName], getRelOpts)
        .then(function (rel) {
            return cb.Promise(relTypes && isValidRelationshipType(rel, relTypes));
        });
}

module.exports = {
    saveRelationship: promise.fbind(saveRelationship),
    getRelationships: getRelationships,
    getRelationship: getRelationship,
    isRelated: isRelated,
    canViewRelationshipUser: canViewRelationshipUser,
    getRelKey: getRelKey
};