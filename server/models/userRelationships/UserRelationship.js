"use strict";
require('require-enhanced')();

var mongoose = require('mongoose');
var validRelationships = ['friend', 'guardian', 'child', 'surrogate'];
var validStatuses = ['pending', 'active', 'inactive'];

var schema = mongoose.Schema({
    sourceUser: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: '{PATH} is required!' },
    relUser: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: '{PATH} is required!' },
    relationship: {type: String, enum: validRelationships, lowercase: true, required: '{PATH} is required!' },
    relStatus: { type: String, enum: validStatuses, default: 'pending', lowercase: true, required: '{PATH} is required!' }
}, { collection: "userRelationships"});

//Indices
schema.index({ "sourceUser" : 1, "relUser": 1 }, { unique: true });

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
    }

};

//Virtual Getters
// --NONE--


//Create model
var UserRelationship = mongoose.model('UserRelationship', schema);
console.log('Loaded model: UserRelationship');



