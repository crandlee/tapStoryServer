'use strict';
require('require-enhanced')();

var resSvc = global.rootRequire('svc-resource');
var relSvcOptions = global.rootRequire('svc-opts-rel');
var userSvc = global.rootRequire('svc-user');

function saveRelationship(sourceUserName, relUserName, relationship, options) {

    //Create a clone of options so they can be reset between savings
    var initOptions = global.extend({}, options);

    function getComplementRelationship(rel) {
        var relTest = (rel && rel.toLowerCase());
        if (relTest) {
            if (relTest === 'friend') return 'friend';
            if (relTest === 'guardian') return 'child';
            if (relTest === 'surrogate') return 'child';
        }
        return null;
    }
    //Any relationship is a two-way.
    //Possible options: friend-friend, guardian-child, surrogate-child
    var complementRel = getComplementRelationship(relationship);
    if (complementRel) {

        return resSvc.processDocumentSave({ sourceUser: sourceUserName, relUser: relUserName, relationship: relationship },
            relSvcOptions.setSaveRelationshipOptions, options)
            .then(function () {
                options = initOptions;
                return resSvc.processDocumentSave({ relUser: sourceUserName, sourceUser: relUserName, relationship: complementRel },
                    relSvcOptions.setSaveRelationshipOptions, options)
                        .then(function() {
                            return [
                                { sourceUser: sourceUserName, relUser: relUserName, relationship: relationship },
                                { relUser: sourceUserName, sourceUser: relUserName, relationship: complementRel }
                            ];
                        });
            });

    } else {
        global.errSvc.error('Could not find a relationship match for requested relationship', { rel: relationship });
    }

}

function getRelationships(sourceUser) {

    return userSvc.getSingle(sourceUser)
        .then(function(user) {
            if (!user) global.errSvc.error('Could not find user to get relationships', { userName: sourceUser });
            return resSvc.getList({ find: {sourceUser: user._id}, populate: ['relUser'], model: 'UserRelationship'  })
                .then(function(relationships) {
                    return relationships;
                });
        });

}


module.exports = {
    saveRelationship: global.Promise.fbind(saveRelationship),
    getRelationships: getRelationships
};