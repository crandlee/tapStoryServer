"use strict";
require('require-enhanced')();

var mongoose = require('mongoose');

function save(opts) {

    opts = opts || {};

    /**
     *     <p>Builds complete list of options for saving.</p>
     *     <p>The following are some of the options that this function builds/extends</p>
     *     <p><ul>
     *         <li>addOnly / updateOnly : Indicates whether the resource can only be new / only updated.
     *              Without these options, the save will do either depending on the existence of the resource</li>
     *         <li>model : Either pass in an existing mongoose model or one will be built with getModelFromOptions</li>
     *         <li>find : MongoDb styled search criteria to be used to find an existing resource to update</li>
     *         <li>mapPropertiesToUpdateDoc : A function that takes an options object and an initial resource and returns the object used for the MongoDb update parameter.</li>
     *         <li>preValidation: A function that takes an options object and does some simple validation of the options, throwing an error if something is wrong. This occurs before an attempted save.</li>
     *     </ul></p>
     * @params {Object} opts Any initial options for save that will be extended
     * @function
     */
    var setupOptions = opts.setupOptionsStub || function(opts) {

        opts.addOnly = opts.addOnly || false;
        opts.updateOnly = opts.updateOnly || false;
        opts.model = opts.model || getModelFromOptions(opts);
        opts.find = opts.find || null;
        opts.save = opts.save || null;

        opts.preValidation = opts.preValidation || null;

        return opts;

    };

    var validateOptions = opts.validateOptionsStub || global.Promise.fbind(function(opts) {

        if (!opts.find)
            global.errSvc.error('No search criteria set for save',
                { modelName: (opts.model && opts.model.modelName) });
        if ((!opts.save || typeof opts.save !== 'function')
            && (!opts.manualSave || typeof opts.manualSave !== 'function'))
            global.errSvc.error('Resource options must have either a save function or a manualSave function',
                { modelName: (opts.model && opts.model.modelName) });

        //Other validation published in the options
        if (opts.preValidation && typeof opts.preValidation === 'function')
            return global.Promise.fcall(opts.preValidation, opts);
        else
            return opts;

    });


    var saveTheResource = opts.saveTheResourceStub || function(opts) {

        opts = opts || {};
        if (opts.manualSave && (typeof opts.manualSave === 'function'))
            return global.Promise.fcall(opts.manualSave, opts);
        else
            return global.Promise.fcall(opts.save, opts);

    };

    setupOptions(opts);
    return validateOptions(opts)
        .then(saveTheResource);

}

function getSingle(opts) {

    var setupOptions = function(opts) {

        opts = opts || {};
        opts.model = opts.model || getModelFromOptions(opts);
        if (!opts.query) global.errSvc.error('No query provided for resource',
            { modelName: (opts.model && opts.model.modelName) });

        return opts;
    };

    var getResource = function(opts) {

        return global.Promise(opts.model.findOne(opts.query, opts.select || '').exec())
            .then(function(resource) {
                //Clean up and keep going
                postOperationCleanup(opts);
                return resource;
            })
            .fail(function (err) {
                if (err) global.errSvc.error('An error was returned retrieving the resource',
                    { error: err.message, modelName: opts.model.modelName, select: opts.select, query: opts.query });
            });

    };

    setupOptions(opts);

    return getResource(opts);

}

function saveResource(resource) {

    var dfr = global.Promise.defer();
    try {
        if (resource) {
            resource.save(function(err) {
                if (err) global.errSvc.error('Could not save resource',
                    { resource: JSON.stringify(resource), error: err.message });
                dfr.resolve(resource);
            });
        } else {
            global.errSvc.error('No resource to be updated', {});
        }
    } catch(err) {
        dfr.reject(err);
    }
    return dfr.promise;

}

function getList(opts) {

    var setupOptions = function(opts) {

        opts = opts || {};
        opts.model = opts.model || getModelFromOptions(opts);
        if (!opts.query) global.errSvc.error('No query provided for resource list',
            { modelName: (opts.model && opts.model.modelName) });
        return opts;
    };

    var getResources = function(opts) {

        return global.Promise(opts.model.find(opts.query, opts.select || '').exec())
            .then(function(resources) {
                if (!resources || resources.length === 0)
                    global.errSvc.error('No resources were returned',
                    { modelName: opts.model.modelName, select: opts.select, query: opts.query });
                //Clean up and keep going
                postOperationCleanup(opts);
                return resources;
            })
            .fail(function (err) {
                if (err) global.errSvc.error('An error was returned retrieving the resource',
                    { error: err.message, modelName: opts.model.modelName, select: opts.select, query: opts.query });
            });


    };

    setupOptions(opts);

    return getResources(opts);

}

function processResourceSave(params, setupFunction, options) {

    var completeOptions = global.extend(options, params);
    if (setupFunction && typeof setupFunction === 'function')
        completeOptions = setupFunction(completeOptions);

    //promise (call through 'this' to allow test stubbing)
    /* jshint validthis:true */
    return this.save(completeOptions);

}

function getModelFromOptions(options) {

    var modelName = (options && options.modelName) || '';
    try {
        var model = mongoose.model(modelName);
        if (!model) {
            global.errSvc.error({ modelName: modelName }, 'No model set for the resource', 'resourceService.getModelFromOptions');
        }
        return model;
    } catch(err) {
        global.errSvc.error("Unable to set the model for the resource",
            { error: err.message, modelName: modelName });
    }


}

/**
 * Calls update on a mongoose model with all the expected parameters
 * @param {Object} model A mongoose model object
 * @param {Object} documents A MongoDb style update criteria
 * @param {Object} options MongoDb update options
 * @returns {adapter.deferred.promise|*|promise|Q.promise}
 * @throws MongoDb error if update fails
 */
function modelUpdate(model, find, documents, options) {

    var dfr = global.Promise.defer();
    try {
        options = options || {};
        if (!find)
            throw new Error('No search criteria provided for model update');
        options.updateOptions = global.extend({ upsert: !options.updateOnly, new: true }, options.updateOptions);
        documents = global.extend(documents, { $setOnInsert: options.onNew });
        model.findOneAndUpdate(find, documents, options.updateOptions, function(err, obj) {
            if (err) throw err;
            dfr.resolve(obj);
        });

    } catch(e) {
        dfr.reject(e);
    }

    dfr.promise.fin(function() {
        if (options.modelCleanup !== false) postOperationCleanup(options);
    });

    return dfr.promise;


}

function modelCreate(model, documents, options) {

    var dfr = global.Promise.defer();
    try {
        documents = global.extend(documents, options.onNew);
        model.create(documents, function(err, obj) {
            if (err) throw err;
            if (arguments.length > 3) {
                //Case where more than one document was added return an array
                obj = Array.prototype.slice.call(arguments, 2);
            }
            dfr.resolve(obj);
        });
    } catch(e) {
        dfr.reject(e);
    }

    dfr.promise.fin(function() {
        if (options.modelCleanup !== false) postOperationCleanup(options);
    });

    return dfr.promise;


}


function modelSave(model, documents, options) {

    if (options.addOnly) {
        return modelCreate(model, documents, options);
    } else {
        return modelUpdate(model, options.find, documents, options);
    }

}

function postOperationCleanup(opts) {
    opts.model = null;
}

module.exports = {
    save: global.Promise.fbind(save),
    getSingle: global.Promise.fbind(getSingle),
    getList: global.Promise.fbind(getList),
    saveResource: saveResource,
    modelUpdate: modelUpdate,
    modelCreate: modelCreate,
    modelSave: modelSave,
    processResourceSave: global.Promise.fbind(processResourceSave),
    _getModelFromOptions: getModelFromOptions
};