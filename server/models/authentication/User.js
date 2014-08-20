"use strict";
require('require-enhanced')();

var mongoose = require('mongoose');
var encryptionUtility = global.rootRequire('util-encryption');
var authorizeSvc = global.rootRequire('svc-auth');
var linkSvc = global.rootRequire('svc-link');
var uuid = require('node-uuid');
var errSvc = global.rootRequire('svc-error')(null, 'User');
var _ = require('lodash');

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
    fileGroup: [
        {
            groupId: { type: String, default: uuid.v4() },
            fileName: { type: String }
        }
    ]
});

//TODO-Randy Add unique index to fileGroup

//Instance methods
schema.methods = {

    addFile: function(fileName, groupId) {

        //Validation
        if (!fileName) errSvc.throwError( { userName: this.userName }, "Attempted to add a file with empty file name");
        var newFileGroup = buildFileGroup(groupId, fileName);
        if (fileGroupExistingIndex.call(this, newFileGroup) === -1) {

            //Add file to group
            groupId = groupId || uuid.v4();
            this.fileGroup.splice(fileGroupIndexToAdd.call(this, newFileGroup), 0, newFileGroup);
            return groupId;

        } else {
            errSvc.buildAndLogError( { userName: this.userName, fileGroup: newFileGroup }, "File already exists for this user" );
            return null;
        }

    },

    removeFile: function(groupId, fileName) {

        var removeFileGroup = buildFileGroup(groupId, fileName);
        var existingIndex = fileGroupExistingIndex.call(this, removeFileGroup);
        if (existingIndex > -1) {
            this.fileGroup.splice(existingIndex, 1);
        }

    },

    authenticate: function (passwordToMatch) {
        return encryptionUtility.checkEqualToken(passwordToMatch, this.userSecret);
    },

    hasRole: function (role) {
        return (this.roles.indexOf(role) > -1) && (authorizeSvc.isValidRole(role));
    },

    viewModel: function (type) {
        var obj = {
            id: this.id,
            firstName: this.firstName,
            lastName: this.lastName,
            userName: this.userName,
            roles: this.roles
        };
        switch (type) {
            case 'users':
                obj = linkSvc.attachLinksToObject(obj, [
                    { uri: '/user/' + this.userName, rel: 'user', isSelf: true}
                ]);
                break;
            case 'user':
                obj = linkSvc.attachLinksToObject(obj, [
                    { uri: '/../../users', rel: 'users', isRelative: true },
                    { uri: '/roles', rel: 'roles', isRelative: true }
                ]);
                break;
            default:
        }
        return obj;

    }
};


//Static Methods
schema.statics._setErrorService = function(errorService){
    errSvc = errorService;
};

//Virtual Getters
// --NONE--


//Create model
var User = mongoose.model('User', schema);
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
                });
        }
    });

}

function buildFileGroup(groupId, fileName) {

    return {
        groupId: groupId,
        fileName: fileName
    }
}

function fileGroupExistingIndex(newFileGroup) {

    return _.findIndex(this.fileGroup, function(existFileGroup) {
        return existFileGroup.groupId === newFileGroup.groupId
            && existFileGroup.fileName.toLowerCase() === newFileGroup.fileName.toLowerCase()
    });

}

function fileGroupIndexToAdd(newFileGroup) {

    return _.sortedIndex(this.fileGroup, newFileGroup, function(fileGroupToTest) {
            return fileGroupToTest.groupId + fileGroupToTest.fileName;
    });

}