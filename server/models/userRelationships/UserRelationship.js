"use strict";
require('require-enhanced')();

var mongoose = require('mongoose');
var validRelationships = ['friend', 'parent', 'child'];
var validStatuses = ['pending', 'active', 'inactive'];

var resSvc = global.rootRequire('svc-resource');

var schema = mongoose.Schema({
    sourceUser: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: '{PATH} is required!' },
    relUser: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: '{PATH} is required!' },
    relationship: {type: String, enum: validRelationships, lowercase: true, required: '{PATH} is required!' },
    relStatus: { type: String, enum: validStatuses, default: 'pending', lowercase: true, required: '{PATH} is required!' }
}, { collection: "userRelationships"});

//Indices


//Instance methods
schema.methods = {

};

//Statics
schema.statics = {

    isValidStatus: function (status) {
        return validStatuses.indexOf(status.toLowerCase()) > -1;
    },
    isValidRelationship: function (rel) {
        return validRelationships.indexOf(rel.toLowerCase()) > -1;
    },
    addFromUserNames: function (sourceUserName, relUserName, relationship) {

        function validateUsersList(users) {

            //Check for two records.  If not, then warn and do not continue
            if (!users || users.length !== 2) {
                global.errSvc.warn("Attempted to create a user relationship but did not return 2 records",
                    { count: (users && users.length), source: sourceUserName, rel: relUserName, relationship: relationship});
                return false;
            }
            return true;

        }

        return resSvc.getList({ modelName: 'User', query: { "userName": { $in: [sourceUserName, relUserName] }}})
            .then(function (users) {
                if (validateUsersList(users)) {
                    var sourceUserId, relUserId;
                    if (users[0].userName.toLowerCase() === sourceUserName.toLowerCase()) {
                        sourceUserId = users[0]._id;
                        relUserId = users[1]._id;
                    } else {
                        sourceUserId = users[1]._id;
                        relUserId = users[0]._id;
                    }
                    return resSvc.modelUpdate({ sourceUser: sourceUserId, relUser: relUserId },
                        { sourceUser: sourceUserId, relUser: relUserId, relationship: relationship },
                        { model: 'UserRelationship'});
                }
            });
    }


};

//Virtual Getters
// --NONE--


//Create model
var UserRelationship = mongoose.model('UserRelationship', schema);
console.log('Loaded model: UserRelationship');



