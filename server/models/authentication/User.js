"use strict";
require('require-enhanced')();

var mongoose = require('mongoose');
var encryptionUtility = global.rootRequire('util-encryption');
var authorizeSvc = global.rootRequire('svc-auth');
var uuid = require('node-uuid');
var viewModels = global.rootRequire('vm-user');

//Schema setup
var schema = mongoose.Schema({
    firstName: {type: String, required: '{PATH} is required!'},
    lastName: {type: String, required: '{PATH} is required!'},
    userName: {
        type: String,
        required: '{PATH} is required!',
        unique: true
    },
    userSecret: {type: String, required: '{PATH} is required!'},
    roles: [{ type: String, lowercase: true}],
    fileGroups: [
        {
            groupId: { type: String, default: uuid.v4() },
            groupName: { type: String },
            files: [
                { fileName: { type: String } }
            ]
        }
    ]
});

//Indices
schema.index({ "userName" : 1, "fileGroups.groupId": 1 }, { unique: true });
schema.index({ "userName" : 1, "fileGroups.groupName": 1 }, { unique: true });
schema.index({ "userName" : 1, "fileGroups.groupName": 1, "fileGroups.files.fileName": 1 }, { unique: true });


//Instance methods
schema.methods = {

    addFiles: function (fileNames, groupId, groupName) {

        var buildEditingFileGroup = function(groupId, groupName, existing) {
            if (existing && groupName) existing.groupName = groupName;
            if (!existing && !groupName)
                throw new Error('Must provide a group name if file group is not an existing one');
            return existing || { groupId: groupId, groupName: groupName, files: [] };
        };

        if (fileNames && !Array.isArray(fileNames)) fileNames = [fileNames];
        if (!fileNames) fileNames = [];
        groupId = groupId || uuid.v4();

        var existingGroup = this.getFileGroup(groupId);

        var editingGroup = buildEditingFileGroup( groupId, groupName, existingGroup);

        //Remove any files that are duplicates
        global._.remove(fileNames, function(fileName) {
            return (!!global._.find(editingGroup.files, function(file) {
                return file.fileName.toLowerCase() === fileName.toLowerCase();
            }));
        });
        fileNames = fileNames.map(function(fileName) {
           return { fileName: fileName };
        });
        editingGroup.files = editingGroup.files.concat(fileNames);
        if (!existingGroup) this.fileGroups.push(editingGroup);

    },


    getFileGroup: function(groupId) {

        return global._.find(this.fileGroups, function(fg) {
            return fg.groupId === groupId;
        });

    },

    authenticate: function (passwordToMatch) {
        //Promise
        return encryptionUtility.checkEqualToken(passwordToMatch, this.userSecret);
    },

    hasRole: function (roles) {

        var that = this;
        if (!Array.isArray(roles)) roles = [roles];
        global._.chain(roles)
            .map(function(role) {
                return (that.roles.indexOf(role) > -1) && (authorizeSvc.isValidRole(role));
            })
            .reduce(function(allRolesValid, roleValid) {
               return allRolesValid && roleValid;
            })
            .value();

    },

    viewModel: function (type, apiPath, doc) {
        //If no doc passed in, then use the base (User) doc
        return viewModels[type](doc || this, apiPath);
    }

};


//Virtual Getters
// --NONE--


//Create model
var User = mongoose.model('User', schema);
console.log('Loaded model: User');

createDefaultUsers();

//Private functions

function createDefaultUsers() {

    function createUser(firstName, lastName, userName, password, roles) {
        return encryptionUtility.saltAndHash(password)
            .then(function(token) {
                return global.Promise(User.create({ firstName: firstName, lastName: lastName, userName: userName, userSecret: token, roles: roles }))
                    .then(function(ret) {
                        return global.Promise(ret);
                    });
            })
    }

    User.find({}).exec(function (err, collection) {
        if (collection.length === 0) {

            var promiseArr = [];
            promiseArr.push(createUser('Starter', 'Admin', 'starterAdmin', 'admin1234', ['admin']));
            promiseArr.push(createUser('Starter', 'SuperAdmin', 'starterSuperAdmin', 'superadmin1234', ['super-admin']));
            promiseArr.push(createUser('Starter', 'User', 'starterUser', 'user1234', ['user']));
            global.Promise.all(promiseArr)
                .fail(function () {
                    console.log('Could not create default users.');
                })
                .done();
        }
    });

}



