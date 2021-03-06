"use strict";
var cb = require('common-bundle')();
var _ = cb._;
var relCtrl = cb.rootRequire('ctrl-rel');
var userCtrl = cb.rootRequire('ctrl-user');
var enums = cb.rootRequire('enums');


module.exports = {
    addFriendship: _.partial(relCtrl.saveRelationship,
        { rel: enums.relationships.friend, status: enums.statuses.pending},
        { rel: enums.relationships.friend, status: enums.statuses.pendingack}, {}),
    acknowledgeFriendship: _.partial(relCtrl.saveRelationship,
        { rel: enums.relationships.friend, status: enums.statuses.active},
        { rel: enums.relationships.friend, status: enums.statuses.active}, {updateOnly: true}),
    deactivateFriendship: _.partial(relCtrl.saveRelationship,
        { rel: enums.relationships.friend, status: enums.statuses.inactive},
        { rel: enums.relationships.friend, status: enums.statuses.inactive}, {}),
    getFriendships: _.partial(relCtrl.getRelationships, enums.relationships.friend),
    getFriend: userCtrl.getUser,
    addGuardianship: _.partial(relCtrl.saveRelationship,
        { rel: enums.relationships.guardian, status: enums.statuses.active},
        { rel: enums.relationships.child, status: enums.statuses.active}, {}),
    addAdditionalGuardian: relCtrl.addAdditionalGuardian,
    getGuardianships: _.partial(relCtrl.getRelationships, enums.relationships.guardian),
    deactivateGuardianship: _.partial(relCtrl.saveRelationship,
        { rel: enums.relationships.guardian, status: enums.statuses.inactive},
        { rel: enums.relationships.child, status: enums.statuses.inactive}, {  }),
    activateChild: relCtrl.activateSubordinate
};