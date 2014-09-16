"use strict";
var cb = require('common-bundle')();
var _ = cb._;


var roles = ['admin', 'user', 'super-admin'];

function isValidRole(role) {
    return (_.indexOf(roles, role) > -1);
}

module.exports = {
  isValidRole: isValidRole
};