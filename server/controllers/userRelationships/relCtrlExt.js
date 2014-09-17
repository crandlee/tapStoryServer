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
        { rel: enums.relationships.child, status: enums.statuses.active}, { addSubordinate: true }),
    getGuardianships: _.partial(relCtrl.getRelationships, enums.relationships.guardian),
    getChild: userCtrl.getUser,
    updateChild: function(req, res, next) {
      return relCtrl.updateSubordinate(enums.relationships.child, req, res, next);
    },
    deactivateChild: relCtrl.deactivateSubordinate,
    activateChild: relCtrl.activateSubordinate

};