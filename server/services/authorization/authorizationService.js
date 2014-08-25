"use strict";
require('require-enhanced')();

var roles = ['admin', 'user'];

function isValidRole(role) {
    return (global._.indexOf(roles, role) > -1);
}

module.exports = {
  isValidRole: isValidRole
};