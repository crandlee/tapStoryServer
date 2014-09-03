"use strict";
require('require-enhanced')();

var resSvc = global.rootRequire('svc-resource');

function setSaveRelationshipOptions(opts) {

    opts.modelName = 'UserRelationship';

    opts.buildDocument = function(opts, document) {
        document.sourceUser = opts.sourceUserId;
        document.relUser = opts.relUserId;
        document.relationship = opts.relationship;
        document.relStatus = opts.relStatus;
        return document;
    };

    return resSvc.getList({ modelName: 'User', find: { "userName": { $in: [opts.sourceUser, opts.relUser] }}})
        .then(function(users) {

            //A little pre-pre-validation
            if (!users || users.length !== 2)
                global.errSvc.error('Attempted to create a user relationship without two distinct existing user names');
            if (!opts.sourceUser)
                global.errSvc.error('Source user name must be valid');

            var userIds = getIdsFromUserDocs(users, opts.sourceUser);
            opts.find = { sourceUser: userIds[0], relUser: userIds[1] };

            //Set up the data properly
            opts.sourceUserId = userIds[0];
            opts.relUserId = userIds[1];

            function getIdsFromUserDocs(users, sourceUserName) {
                if (users[0].userName.toLowerCase() === sourceUserName.toLowerCase()) {
                    return [users[0]._id, users[1]._id];
                } else {
                    return [users[1]._id, users[0]._id];
                }

            }

            opts.preValidation = function(opts) {
                if (!opts.relUser)
                    global.errSvc.error('relUser is not valid');
                if (!opts.relationship || !opts.model.isValidRelationship(opts.relationship))
                    global.errSvc.error('relationship is not valid: must be from approved list');
                if (opts.status && !opts.model.isValidStatus(opts.status))
                    global.errSvc.error('status is not valid: must be from approved list');
                return opts;
            };

            return global.Promise(opts);
        });
}

module.exports = {
    setSaveRelationshipOptions: setSaveRelationshipOptions
};
