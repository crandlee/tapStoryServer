"use strict";
require('require-enhanced')();

var mongoose = require('mongoose');
var encryptionUtility = global.rootRequire('util-encryption');
var authorizeSvc = global.rootRequire('svc-auth');
var linkSvc = global.rootRequire('svc-link');
var uuid = require('node-uuid');;

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
    roles: [String],
    fileGroups: [
        {
            groupId: { type: String, default: uuid.v4() },
            groupName: { type: String },
            files: [
                { type: String }
            ]
        }
    ]
});

//TODO-Randy Add unique index to fileGroup

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
        editingGroup.files = global._
            .chain((editingGroup.files || []).concat(fileNames))
            .uniq()
            .sortBy(function(name) { return name; })
            .value();

        if (!existingGroup) this.fileGroups.push(editingGroup);

    },

    removeFile: function(fileName, groupId) {

        var fileGroup = this.getFileGroup(groupId);

        if (fileGroup) global._.remove(fileGroup.files, function(name) {
            return name.toLowerCase() === fileName.toLowerCase();
        });

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

    hasRole: function (role) {
        return (this.roles.indexOf(role) > -1) && (authorizeSvc.isValidRole(role));
    },

    viewModel: function (type, path) {
        var obj = {
            id: this.id,
            firstName: this.firstName,
            lastName: this.lastName,
            userName: this.userName,
            roles: this.roles
        };
        var path = path || '';
        switch (type) {
            case 'users':
                obj = linkSvc.attachLinksToObject(obj, [
                    { uri: '/' + this.userName, rel: 'user', isSelf: true}
                ], path);
                break;
            case 'user':
                obj = linkSvc.attachLinksToObject(obj, [
                    { uri: '/roles', rel: 'roles' },
                    { uri: '/fileGroups', rel: 'fileGroups' },
                    { uri: '/fileGroups', rel: 'fileGroup', method: 'DELETE' },
                    { uri: '/fileHelper', rel: 'fileHelper' }
                ], path);
                break;
            default:
        }
        return obj;

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
    User.find({}).exec(function (err, collection) {
        if (collection.length === 0) {
            encryptionUtility.saltAndHash('admin1234')
                .then(function (token) {
                    User.create({ firstName: 'Starter', lastName: 'Admin', userName: 'admin@gmail.com', userSecret: token, roles: ['admin'] });
                })
                .fail(function () {
                    console.log('Could not create default user.');
                })
                .done();
        }
    });

}



