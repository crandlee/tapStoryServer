"use strict";
require('require-enhanced')();

var roles = ['admin', 'user', 'super-admin'];

function isValidRole(role) {
    return (global._.indexOf(roles, role) > -1);
}

module.exports = {
  isValidRole: isValidRole
};