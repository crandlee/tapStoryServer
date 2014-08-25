"use strict";
require('require-enhanced')();

var mongoose = require('mongoose');
var utilObj = global.rootRequire('util-object');

function save(opts) {

    var setupOptions = opts.setupOptionsStub || function(opts) {

        //Options to restrict whether a resource can be added/updated
        opts.addOnly = opts.addOnly || false;
        opts.updateOnly = opts.updateOnly || false;

        //Allow model to be set externally for testing purposes
        opts.model = opts.model || getModelFromOptions(opts);

        //Get the search criteria for a single resource
        opts.singleSearch = opts.singleSearch || null;
        if (opts.addOnly) opts.singleSearch = opts.singleSearch || { _id: 0 };

        //Get the map function for properties to a resource
        opts.mapPropertiesToResource = opts.mapPropertiesToResource || null;

        //Allow for some pre-validation and rejection via promise
        opts.preValidation = opts.preValidation || null;

        return opts;

    };

    var validateOptions = opts.validateOptionsStub || global.Promise.fbind(function(opts) {

        if (!opts.singleSearch)
            global.errSvc.error('No search criteria set for a single instance of the model',
                { modelName: (opts.model && opts.model.modelName) });
        if (!opts.mapPropertiesToResource || typeof opts.mapPropertiesToResource !== 'function')
            global.errSvc.error('Missing map function',
                { modelName: (opts.model && opts.model.modelName) });

        //Other validation published in the options
        if (opts.preValidation && typeof opts.preValidation === 'function')
            return opts.preValidation(opts);
        else
            return opts;

    });

    var saveAddedResource = opts.saveAddedResourceStub || function(opts, resource) {

        if (opts.onNew) resource = global.extend(resource, opts.onNew);
        var returnResource = function(resource) {
            if (resource && resource._id) return resource;
        };
        return global.promiseUtils.deNodeify(opts.model.create, opts.model)(resource)
            .then(returnResource)
            .fail(function(err) {
                if (err) global.errSvc.error('Could not create new resource',
                    { resource: JSON.stringify(resource), error: err.message, modelName: opts.model.modelName });
            });

    };

    var addResource = opts.addResourceStub || function(opts) {
        if (opts.updateOnly)
            global.errSvc.error('Can only update existing resource with this method',
                { modelName: opts.model.modelName }, { internalCode: "E1002"});

        return opts.mapPropertiesToResource({}).then(global._.partial(saveAddedResource, opts));

    };

    var saveUpdatedResource = opts.saveUpdatedResourceStub || function(opts, resource) {

        return global.promiseUtils.deNodeify(resource.save, opts.model)()
            .then(function(resource) { return resource; })
            .fail(function(err) {
                if (err) global.errSvc.error('Could not update resource',
                    { resource: JSON.stringify(resource), error: err.message, modelName: opts.model.modelName });
            });

    };

    var updateResource = opts.updateResourceStub || function(opts, resource) {
        if (opts.addOnly) global.errSvc.error('Can only create new resource with this method',
            { modelName: opts.model.modelName }, { internalCode: "E1000"});

        return opts.mapPropertiesToResource(resource, opts).then(global._.partial(saveUpdatedResource, opts));

    };

    var saveResource = opts.saveResourceStub || function(opts) {

        return global.promiseUtils.deNodeify(opts.model.findOne, opts.model)(opts.singleSearch)
            .then(function(resource) {
                return !resource ? addResource(opts) : updateResource(opts, resource);
            })
            .fail(function (err) {
                if (err) global.errSvc.error('Could not get resource model for add/update',
                    { error: err.message, modelName: opts.model.modelName });
            });


    };


    setupOptions(opts);
    return validateOptions(opts)
        .then(saveResource);

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

        return global.promiseUtils.deNodeify(opts.model.findOne, opts.model)(opts.query, opts.select || '')
            .then(function(resource) {
                if (!resource) global.errSvc.error('No resource was returned',
                    { modelName: opts.model.modelName, select: opts.select, query: opts.query });
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

function getList(opts) {

    var setupOptions = function(opts) {

        opts = opts || {};
        opts.model = opts.model || getModelFromOptions(opts);
        if (!opts.query) global.errSvc.error('No query provided for resource list',
            { modelName: (opts.model && opts.model.modelName) });
        return opts;
    };

    var getResources = function(opts) {

        return global.promiseUtils.deNodeify(opts.model.find, opts.model)(opts.query, opts.select || '')
            .then(function(resources) {
                if (!resources || resources.length === 0)
                    global.errSvc.error('No resources were returned',
                    { modelName: opts.model.modelName, select: opts.select, query: opts.query });
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
    var model = mongoose.model(modelName);
    if (!model) {
        global.errSvc.error({ modelName: modelName }, 'No model set for the resource', 'resourceService.getModelFromOptions');
    }
    return model;

}

module.exports = {
    save: global.Promise.fbind(save),
    getSingle: global.Promise.fbind(getSingle),
    getList: global.Promise.fbind(getList),
    processResourceSave: global.Promise.fbind(processResourceSave),
    _getModelFromOptions: getModelFromOptions
};