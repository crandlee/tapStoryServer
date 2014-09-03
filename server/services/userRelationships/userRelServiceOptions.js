"use strict";
require('require-enhanced')();

var resSvc = global.rootRequire('svc-resource');

function setSaveRelationshipOptions(opts) {

    opts.modelName = 'UserRelationship';
    opts.preValidation = function(opts) {
        if (!opts.sourceUser)
            global.errSvc.error('Source user name must be valid');
        if (!opts.relUser)
            global.errSvc.error('Rel user name must be valid');
        if (!opts.relationship || !opts.model.isValidRelationship(opts.relationship))
            global.errSvc.error('Rel user name must be valid');
        return opts;
    };
    opts.manualSave = function(opts) {
        return opts.model.addFromUserNames(opts.sourceUser, opts.relUser, opts.relationship);
    };
    return opts;
}

module.exports = {
    setSaveRelationshipOptions: setSaveRelationshipOptions
};
