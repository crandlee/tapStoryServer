'use strict';
var cb = require('common-bundle')();
var _ = cb._;
var errSvc = cb.errSvc;
var promise = cb.Promise;

var resSvc = cb.rootRequire('svc-resource');
var relSvcOptions = cb.rootRequire('svc-opts-rel');
var userSvc = cb.rootRequire('svc-user');

function saveRelationship(sourceRel, targetRel, options) {

    return resSvc.processDocumentSave({ participants: [sourceRel, targetRel] },
        relSvcOptions.setSaveRelationshipOptions, options);

}

function getRelationships(sourceUser, relationship, statuses) {

    return userSvc.getSingle(sourceUser)
        .then(function(user) {
            if (!user) errSvc.error('Could not find user to get relationships', { userName: sourceUser });
            var find = { "participants.user" : user._id };
            if (relationship) find = cb.extend(find, { "participants.rel" : relationship });
            if (statuses && !Array.isArray(statuses)) statuses = [statuses];
            if (statuses) find = cb.extend(find, { "participants.status" : { $in: statuses }});
            return resSvc.getList({ find: find, populate: ['participants.user'], model: 'UserRelationship'  })
                .then(function(relationships) {
                    //TODO-Randy: filter out records where the relationship string is
                    //"on the other side" of the relationship
                    return relationships;
                });
        });

}

function getRelationship(userNames, options) {
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

module.exports = {
    saveRelationship: promise.fbind(saveRelationship),
    getRelationships: getRelationships,
    getRelationship: getRelationship,
    canViewRelationshipUser: canViewRelationshipUser,
    getRelKey: getRelKey
};