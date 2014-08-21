"use strict";
require('require-enhanced')();

var resourceSvc = global.rootRequire('svc-resource');
var userSvcOptions = global.rootRequire('svc-opts-user');
var extend = require('extend');
var utilObj = global.rootRequire('util-object');

function _setErrorService(errorService){

    userSvcOptions._setErrorService(errorService);

}

function save(updateProperties, options) {

    options = extend(options, updateProperties);
    userSvcOptions.setSaveUserOptions(options);
    return resourceSvc.save(options);

}

function addRole(userName, newRole) {

    var options = utilObj.args2Obj({},['userName', 'role'], arguments);
    userSvcOptions.setAddRoleOptions(options);
    return resourceSvc.save(options);

}

function removeRole(userName, existRole) {

    var options = utilObj.args2Obj({},['userName', 'role'], arguments);
    userSvcOptions.setRemoveRoleOptions(options);
    return resourceSvc.save(options);

}

function addFile(userName, fileName, groupId) {

    var options = utilObj.args2Obj({},['userName', 'file', 'groupId'], arguments);
    userSvcOptions.setAddFileOptions(options);
    return resourceSvc.save(options);

}

function removeFile(userName, fileName, groupId) {

    var options = utilObj.args2Obj({},['userName', 'file', 'groupId'], arguments);
    userSvcOptions.setRemoveFileOptions(options);
    return resourceSvc.save(options);

}


function getList(query) {

    var options = {};
    options.modelName = 'User';
    options.query = query;
    return resourceSvc.getList(options);

}

function getSingle(userName) {
    var options = {};
    options.modelName = 'User';
    options.query = {userName: userName};
    return resourceSvc.getSingle(options);
}


module.exports = {
    save: save,
    getSingle: getSingle,
    getList: getList,
    addRole: addRole,
    removeRole: removeRole,
    addFile: addFile,
    removeFile: removeFile,
    optionsBuilder: userSvcOptions,
    _setErrorService: _setErrorService
};