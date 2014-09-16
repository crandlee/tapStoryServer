"use strict";
var cb = require('common-bundle')();
var _ = cb._;
var errSvc = cb.errSvc;
var promise = cb.Promise;

var resSvc = cb.rootRequire('svc-resource');

function setSaveRelationshipOptions(opts) {

    var performInitialValidation = function(opts) {

        //Validate participants objects early since they will be used to set
        //up everything
        if (!opts.participants || !Array.isArray(opts.participants) || opts.participants.length !== 2)
            errSvc.error('No participants available for relationship', { participants: opts.participants });
        if (!opts.participants[0] || !opts.participants[1])
            errSvc.error('Missing participants in relationship', { participants: opts.participants });
        if (!opts.participants[0].user || !opts.participants[0].rel || !opts.participants[0].status)
            errSvc.error('Missing data in participant one', { participant: opts.participant[0] });
        if (!opts.participants[1].user || !opts.participants[1].rel || !opts.participants[1].status)
            errSvc.error('Missing data in participant two', { participant: opts.participant[1] });
        var model = resSvc._getModelFromOptions({ modelName: 'UserRelationship' });
        if (!model.isValidStatus(opts.participants[0].status) || !model.isValidStatus(opts.participants[1].status))
            errSvc.error('One or more statuses is invalid', { status1: opts.participants[0].status, status2: opts.participants[1].status });
        if (!model.isValidRelationship(opts.participants[0].rel) || !model.isValidRelationship(opts.participants[1].rel))
            errSvc.error('One or more relationships is invalid', { rel1: opts.participants[0].rel, rel2: opts.participants[1].rel });

    };

    opts.modelName = 'UserRelationship';

    opts.buildDocument = function(opts, document) {

        var ret;
        var changes = [];

        var getRelStatus = function(reqData, prevData, isSourceUser) {

            var ret, status;
            var changes = {};

            var noRevertActiveFriendToPending = function(reqData, prevData) {
                if (reqData.rel === 'friend' && _.indexOf(['pending', 'pendingack'], reqData.status) > -1) {
                    if (!prevData.status || prevData.status === 'inactive')
                        return [reqData.status, {}];
                    else
                        return [prevData.status, {}];
                }
            };
            var allowAckOfPendingFriendshipIfPendingAck = function(reqData, prevData, isSourceUser) {

                if (reqData.rel === 'friend' && reqData.status === 'active') {

                    if(prevData.status === 'pending' && isSourceUser)
                        errSvc.error('The user who requested the friendship cannot acknowledge it');

                    if (prevData.status === 'pendingack' && isSourceUser) {
                        return [reqData.status, { acknowledgement: true }];
                    } else {
                        return [prevData.status, {}];
                    }
                }

            };
            var noNonFriendRelationshipsCanBePending = function(reqData, prevData) {
                if (reqData.rel !== 'friend' && _.indexOf(['pending','pendingack'], reqData.status) > -1) {
                    return [prevData.status, {}];
                }
            };


            //Set some special rules for status changes
            [
                noRevertActiveFriendToPending,
                allowAckOfPendingFriendshipIfPendingAck,
                noNonFriendRelationshipsCanBePending
            ].map(function(fn) {
               if (!status) ret = fn(reqData, prevData, isSourceUser);
               if (ret) { status = ret[0]; changes = cb.extend(changes, ret[1]); }
            });

            if (!status) { status = reqData.status; changes = {}; }
            return [status, changes];

        };

        document.relKey = opts.relKey;
        document.participants = document.participants || [{}, {}];
        ret = getRelStatus(opts.participants[0], document.participants[0], opts.sourceIndex === 0);
        opts.participants[0].status = ret[0]; changes[0] = ret[1];
        ret = getRelStatus(opts.participants[1], document.participants[1], opts.sourceIndex === 1);
        opts.participants[1].status = ret[0]; changes[1] = ret[1];

        //Set other participant to active if there was an acknowledgement
        if (changes[0].acknowledgement) opts.participants[1].status = 'active';
        if (changes[1].acknowledgement) opts.participants[0].status = 'active';

        document.participants = opts.participants;

        return document;
    };


    performInitialValidation(opts);

    return resSvc.getList({ modelName: 'User', find: { "userName": { $in: [opts.participants[0].user, opts.participants[1].user] }}})
        .then(function(users) {

            var prepareUsersAndRelKey = function(opts, users) {

                var swapArray = function(arr) {
                    var tempSwap;
                    tempSwap = arr[0]; arr[0] = arr[1]; arr[1] = tempSwap;
                    return arr;
                };

                //Build unique identifier for two users that will be the search key
                var userRelSvc = cb.rootRequire('svc-rel');

                var relKey = userRelSvc.getRelKey(users.map(function(user) { return user.userName; }));

                opts.find = { relKey: relKey };
                opts.relKey = relKey;


                //Make sure the arrays are sorted in the proper order based on the key
                opts.sourceIndex = 0;
                if (opts.participants[0].user.toLowerCase() !== relKey.slice(0, relKey.indexOf('||'))) {
                    opts.sourceIndex = 1;
                    opts.participants = swapArray(opts.participants);
                }

                //Replace the participants with the appropriate ids replacing the user names
                opts.participants = opts.participants.map(function(updateParticipant) {
                    updateParticipant.user = _.find(users,
                        function(existUser) { return existUser.userName.toLowerCase()
                            === updateParticipant.user.toLowerCase() })._id;
                    return updateParticipant;
                });
            };

            if (!users || !Array.isArray(users) || users.length !== 2)
                errSvc.error('Attempted to create a user relationship without two distinct existing user names');

            prepareUsersAndRelKey(opts, users);

            opts.preValidation = function(opts) {
                //Validation completed previously
                return opts;
            };

            return promise(opts);
        });
}

module.exports = {
    setSaveRelationshipOptions: setSaveRelationshipOptions
};
