"use strict";
require('require-enhanced')();

var authorizeSvc = global.rootRequire('svc-auth');
var encryptionSvc = global.rootRequire('util-encryption');
var resSvc = global.rootRequire('svc-resource');

function saveUserOptions(opts) {

    opts.preValidation = function(opts) {
        if (!opts.userName)
            global.errSvc.error('User Name must be valid');
        return opts;
    };
    opts.onNew = {
        roles: 'user'
    };
    opts.modelName = 'User';
    opts.find = { userName: opts.userName };
    opts.save = function(opts) {

        var doc = {};
        if (opts.firstName) doc.firstName = opts.firstName;
        if (opts.lastName) doc.lastName = opts.lastName;
        if (opts.userName) doc.userName = opts.userName;
        if (opts.password && opts.password.length > 0) {
            return encryptionSvc.saltAndHash(opts.password).then(function (token) {
                doc.userSecret = token;
                return resSvc.modelSave(opts.model, doc, opts);
            });
        } else {
            return resSvc.modelSave(opts.model, doc, opts);
        }


    };

    return opts;
}

function setFileOptions(addOrRemove, opts) {

    opts.updateOnly = true;
    opts.preValidation = global.Promise.fbind(function(opts) {
        if (!opts.userName) global.errSvc.error('User Name must be valid', {});
        if (!opts.groupId) global.errSvc.error('User file group id must be valid', {});
        if (!opts.groupName && !opts.existing && addOrRemove !== 'remove')
            global.errSvc.error('User file group name must be valid', {});
        if (!opts.file) global.errSvc.error('Upload files for user must be valid', {});
        return opts;
    });
    opts.modelName = 'User';
    opts.find = { userName: opts.userName };
    opts.manualSave = function(opts) {

        if (addOrRemove === 'remove') {
            //Remove file
            return resSvc.modelUpdate(opts.model,
                  { "userName": opts.userName, "fileGroups.groupId" : opts.groupId }
                , { $pull: { "fileGroups.$.files": { fileName: opts.file } } });
        } else {
            //Add files
            return resSvc.getSingle({ model: opts.model, query: { userName: opts.userName } })
                .then(function(user) {
                    user.addFiles(opts.file, opts.groupId, opts.groupName);
                    return resSvc.saveResource(user);
                });
        }
    };



//    function addFiles(opts) {
//
//        function addFileGroup(opts) {
//            return resSvc.modelUpdate(opts.model,
//                {"userName" : opts.userName , "fileGroups.groupId": { "$ne": opts.groupId }},
//                { $push: { fileGroups: {  groupId: opts.groupId, groupName: opts.groupName }}})
//        }
//
//        function addFilesToGroup(opts, user) {
//
//            console.log(user.fileGroups);
//            var files = opts.file.map(function(fileName) {
//                return { fileName: fileName };
//            });
//            return resSvc.modelUpdate(opts.model,
//                { "userName": opts.userName, "fileGroups.groupId" : opts.groupId },
//                { $push: { "fileGroups.$.files": { $each: files } }});
//
//        }
//
//
//        return addFileGroup(opts).then(global._.partial(addFilesToGroup, opts));
//
//
//    }

    return opts;
}

function setRemoveFileGroupOptions(opts) {

    opts.preValidation = global.Promise.fbind(function(opts) {
        if (!opts.userName) global.errSvc.error('User Name must be valid', {});
        if (!opts.groupId) global.errSvc.error('User file group id must be valid', {});
        return opts;
    });
    opts.modelName = 'User';
    opts.find = { userName: opts.userName };
    opts.manualSave = function(opts) {

        return resSvc.modelUpdate(opts.model, { "userName" : opts.userName }
            , { $pull : { "fileGroups" : { "groupId": opts.groupId } } });

    };
    return opts;
}


function setAddRoleOptions(opts) {

    opts.updateOnly = true;
    opts.role = (opts.role && opts.role.toLowerCase());
    opts.preValidation = global.Promise.fbind(function(opts) {
        if (!opts.role) global.errSvc.error('New role must be valid');
        if (!opts.userName) global.errSvc.error('User name must be valid');
        return opts;
    });
    opts.modelName = 'User';
    opts.find = { userName: opts.userName };
    opts.manualSave = function(opts) {
        if (opts.role) {
            if (!authorizeSvc.isValidRole(opts.role))
                global.errSvc.error('Not a valid role', { role: opts.role });
            return resSvc.modelUpdate(opts.model, { "userName" : opts.userName }
                , { $addToSet : { "roles" : opts.role } });
        }
    };
    return opts;
}

function setRemoveRoleOptions(opts) {

    opts.updateOnly = true;
    opts.role = (opts.role && opts.role.toLowerCase());
    opts.preValidation = function(opts) {
        if (!opts.role) global.errSvc.error('Role must be valid');
        if (!opts.userName) global.errSvc.error('User name must be valid');
        return opts;
    };
    opts.modelName = 'User';
    opts.find = { userName: opts.userName };
    opts.mapOptionsToDocument = function(opts) {

        return resSvc.modelUpdate(opts.model, { "userName" : opts.userName }
            , { $pull : { "roles" : opts.role } });

    };
    return opts;

}

module.exports = {
    setAddFileOptions: global._.partial(setFileOptions, 'add'),
    setRemoveFileOptions: global._.partial(setFileOptions, 'remove'),
    setAddRoleOptions: setAddRoleOptions,
    setRemoveRoleOptions: setRemoveRoleOptions,
    setRemoveFileGroupOptions: setRemoveFileGroupOptions,
    setSaveUserOptions: saveUserOptions
};
