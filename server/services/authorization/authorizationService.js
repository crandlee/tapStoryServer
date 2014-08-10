"use strict";
require('require-enhanced')();

var _ = require('lodash');
var roles = ['admin', 'user'];

function isValidRole(role) {
    return (_.indexOf(roles, role) > -1);
}

module.exports = {
  isValidRole: isValidRole
};