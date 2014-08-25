"use strict";
require('require-enhanced')();

var mongoose = require('mongoose');
var encryptionUtility = global.rootRequire('util-encryption');
var authorizeSvc = global.rootRequire('svc-auth');
var linkSvc = global.rootRequire('svc-link');
var uuid = require('node-uuid');

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
            files: [
                { type: String }
            ]
        }
    ]
});

//TODO-Randy Add unique index to fileGroup

//Instance methods
schema.methods = {

    addFile: function (fileName, groupId) {

        if (!fileName)
            global.errSvc.error("Attempted to add a file with empty file name", { userName: this.userName });

        var newFile = buildTestFile(groupId, fileName);
        var existingFileGroup = global._.find(this.fileGroup, function (fg) {
            return fg.groupId === newFile.groupId;
        });
        if (fileExistingIndex(existingFileGroup, newFile) === -1) {

            //Add group/file
            newFile.groupId = groupId || uuid.v4();
            if (!existingFileGroup) {
                existingFileGroup = addFileToGroup({ groupId: newFile.groupId, files: []}, newFile);
                this.fileGroup.splice(groupIndexToAdd.call(this, newFile.groupId), 0, existingFileGroup);
            } else {
                addFileToGroup(existingFileGroup, newFile);
            }
            return newFile.groupId;

        } else {

            global.errSvc.warn("File already exists for this user",
                { userName: this.userName, fileGroup: newFile }, "User.addFile");
            return null;
        }

    },

    removeFile: function (groupId, fileName) {

        var removeFile = buildTestFile(groupId, fileName);
        /* jshint validthis:true */
        var targetGroupIndex = global._.findIndex(this.fileGroup, function (fg) {
            return fg.groupId === removeFile.groupId;
        });
        if (targetGroupIndex > -1) {
            var targetGroup = this.fileGroup[targetGroupIndex];
            if (targetGroup) {
                var targetFileIndex = fileExistingIndex(targetGroup, removeFile);
                if (targetFileIndex > -1) {
                    targetGroup.files.splice(targetFileIndex, 1);
                    if (targetGroup.files.length === 0) this.fileGroup.splice(targetGroupIndex, 1);
                }
            }
        }
        return true;
    },

    authenticate: function (passwordToMatch) {
        //Promise
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
                })
                .done();
        }
    });

}

function buildTestFile(groupId, fileName) {

    return {
        groupId: groupId,
        fileName: fileName
    };
}

function fileExistingIndex(existingGroup, file) {

    if (existingGroup && existingGroup.files)
        return existingGroup.files.indexOf(file.fileName.toLowerCase());
    else
        return -1;

}


function groupIndexToAdd(groupId) {

    var testGroup = { groupId: groupId };
    /* jshint validthis:true */
    return global._.sortedIndex(this.fileGroup, testGroup, function (fileGroupToTest) {
        return fileGroupToTest.groupId;
    });

}

function fileIndexToAdd(fileArray, newFile) {

    return global._.sortedIndex(fileArray, newFile.fileName);

}

function addFileToGroup(existingFileGroup, newFile) {

    existingFileGroup.files.splice(fileIndexToAdd(existingFileGroup.files, newFile), 0, newFile.fileName.toLowerCase());
    return existingFileGroup;


}