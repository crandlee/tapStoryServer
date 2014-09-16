"use strict";
var cb = require('common-bundle')();

var mongoose = require('mongoose');
var validRelationships = ['friend', 'guardian', 'child', 'surrogate'];
var validStatuses = ['pending', 'pendingack', 'active', 'inactive'];
var viewModels = cb.rootRequire('vm-rel');


var schema = mongoose.Schema({
    relKey: { type: "String", required: '{PATH} is required!'},
    participants: [
        {
            user: {type: mongoose.Schema.Types.ObjectId, ref: 'User', required: '{PATH} is required!'},
            rel: {type: String, enum: validRelationships, lowercase: true, required: '{PATH} is required!' },
            status: { type: String, enum: validStatuses, default: 'pending', lowercase: true, required: '{PATH} is required!' }
        }
    ]

}, { collection: "userRelationships"});

//Indices
schema.index({ "relKey" : 1 });

//Instance methods
schema.methods = {

    viewModel: function (type, apiPath, options) {
        options = options || {};
        return viewModels[type](options.doc || this, apiPath, options);
    }

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



