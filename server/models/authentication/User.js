"use strict";

var mongoose = require('mongoose');
var encryptionUtility = require('../../utilities/encryptionUtility');
var authorizeSvc = require('../../services/authorization/authorizationService');
var linkSvc = require('../../services/hypermedia/linkService');


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
    roles: [String]
});

//Instance methods
schema.methods = {
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
                    { uri: '/user/' + this.userName, rel: 'user'}
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
// --NONE--
//Virtual Getters
// --NONE--


//Create model
var User = mongoose.model('User', schema);
createDefaultUsers();

//Initial data
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





