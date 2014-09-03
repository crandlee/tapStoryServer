'use strict';
require('require-enhanced')();

var resSvc = global.rootRequire('svc-resource');
var relSvcOptions = global.rootRequire('svc-opts-rel');

function saveRelationship(sourceUserName, relUserName, relationship, options) {

    return resSvc.processDocumentSave({ sourceUser: sourceUserName, relUser: relUserName, relationship: relationship },
        relSvcOptions.setSaveRelationshipOptions, options);

}

module.exports = {
    saveRelationship: saveRelationship
};