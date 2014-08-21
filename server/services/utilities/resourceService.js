"use strict";
require('require-enhanced')();

var errSvc = global.rootRequire('svc-error');
var mongoose = require('mongoose');
var extend = require('extend');
var promiseSvc = global.rootRequire('svc-promise');
var utilObj = global.rootRequire('util-object');


function save(options) {

    //TODO-Randy: unit test

    var pid = promiseSvc.createPromise({ externalPromise: options.externalPromise });

    try {

        var addOnly = (options && options.addOnly) || false;
        var updateOnly = (options && options.updateOnly) || false;

        //Allow model to be set externally for testing purposes
        var model = (options && options.model) || getModelFromOptions(options, pid);

        //Allow for some pre-validation and rejection via promise
        var preValidation = (options && options.preValidation) || null;
        if (preValidation && typeof preValidation === 'function')
            preValidation(options, pid);


        //Get the search criteria for a single resource
        var singleSearch = (options && options.singleSearch) || null;
        if (addOnly) singleSearch = singleSearch || { _id: 0 };
        if (!singleSearch) errSvc.errorFromPromise(pid, {},
                'No search criteria set for a single ' + model.modelName, 'resourceService.save');

        //Get the map function for properties to a resource
        var mapPropertiesToResource = (options && options.mapPropertiesToResource) || null;
        if (!mapPropertiesToResource || typeof mapPropertiesToResource !== 'function')
            errSvc.errorFromPromise(pid, {}, 'Missing map function for ' + model.modelName, 'resourceService.save');

        //Do not continue if any rejections have occurred
        if (promiseSvc.isRejected(pid))
            return promiseSvc.getPromise(pid, { externalPromise: options.externalPromise });


        //Update or Add
        model.findOne(singleSearch).exec(function (err, resource) {

            if (err) errSvc.errorFromPromise(pid, err, 'Could not get ' + model.modelName + ' for update', 'resourceService.save');

            if (resource) {


                if (addOnly)
                    errSvc.errorFromPromise(pid,
                        err, 'Can only create new ' + model.modelName + ' with this method', 'resourceService.save', "E1000");

                var resourceFinal = mapPropertiesToResource(resource, pid);
                if (!promiseSvc.isRejected(pid)) {
                    console.log(resourceFinal);
                    resourceFinal.save(function (err, resource) {
                        if (err) {
                            errSvc.errorFromPromise(pid, err, 'Could not save ' + model.modelName, 'resourceService.save');
                        } else {
                            promiseSvc.resolve(resource, pid);
                        }
                    });

                }

            } else {
                if (updateOnly)
                    errSvc.errorFromPromise(pid,
                        err, 'Can only update ' + model.modelName + ' with this method', 'resourceService.save', "E1002");

                mapPropertiesToResource({})
                    .then(function (resourceFinal) {

                        if (options.onNew) resourceFinal = extend(resourceFinal, options.onNew);

                        model.create(resourceFinal, function (err, resource) {
                            if (err) errSvc.errorFromPromise(pid, err, 'Could not create ' + model.modelName, 'resourceService.save');
                            if (resource && resource._id) promiseSvc.resolve(resource, pid);
                        });
                    })
                    .fail(function (err) {
                        promiseSvc.reject(err, pid);
                    });

            }
        });

        if (options && options.testMode) promiseSvc.clearPromise(pid, { externalPromise: options.externalPromise });

        return promiseSvc.getPromise(pid, { externalPromise: options.externalPromise });

    } catch (e) {

        errSvc.errorFromPromise(pid, { error: e.toString(), resource: (options && options.modelName) || 'unknown' }, 'Error saving resource', 'resourceService.save');
        return promiseSvc.getPromise(pid, { externalPromise: (options && options.externalPromise) });

    }

}

function getSingle(options) {

    var pid = promiseSvc.createPromise({ externalPromise: options.externalPromise });
    try {

        //Allow model to be set externally for testing purposes
        var model = (options && options.model) || getModelFromOptions(options, pid);

        //Set query and select
        var query = (options && options.query) || null;
        if (!query) errSvc.errorFromPromise(pid, {}, 'No query provided for resource ' + model.modelName, 'resourceService.getSingle');
        var select = (options && options.select) || '';


        //Do not continue if any rejections have occurred
        if (promiseSvc.isRejected(pid))
            return promiseSvc.getPromise(pid, { externalPromise: options.externalPromise });

        model.findOne(query, select).exec(function (err, resource) {
            if (err) errSvc.errorFromPromise(pid, err, 'Could not get ' + model.modelName + ' from search', 'resourceService.getSingle');
            if (resource) {
                promiseSvc.resolve(resource, pid);
            } else {
                errSvc.errorFromPromise(pid, {}, 'Could not find ' + model.modelName, 'resourceService.getSingle', 'E1001');
            }
        });

        if (options && options.testMode) promiseSvc.clearPromise(pid, { externalPromise: options.externalPromise });
        return promiseSvc.getPromise(pid, { externalPromise: options.externalPromise });

    } catch (e) {

        errSvc.errorFromPromise(pid, { error: e.toString(), resource: (options && options.modelName) || 'unknown' },
            'Error retrieving a single resource', 'resourceService.getSingle');
        return promiseSvc.getPromise(pid, { externalPromise: (options && options.externalPromise) });

    }

}

function getList(options) {

    var pid = promiseSvc.createPromise({ externalPromise: options.externalPromise });

    try {

        //Allow model to be set externally for testing purposes
        var model = (options && options.model) || getModelFromOptions(options, pid);

        //Set query and select
        var query = (options && options.query) || null;
        if (!query) errSvc.errorFromPromise(pid, {}, 'No query provided for resource ' + model.modelName, 'resourceService.getList');
        var select = (options && options.select) || '';

        //Do not continue if any rejections have occurred
        if (promiseSvc.isRejected(pid))
            return promiseSvc.getPromise(pid, { externalPromise: options.externalPromise });

        model.find(query, select).exec(function (err, resources) {
            if (err) errSvc.errorFromPromise(pid, err, 'Could not get list of ' + model.modelName + ' from search', 'resourceService.getList');
            if (resources && resources.length > 0) {
                promiseSvc.resolve(resources, pid);
            } else {
                errSvc.errorFromPromise(pid, {}, 'Could not find any ' + model.modelName, 'resourceService.getList', 'E1001');
            }
        });

        if (options && options.testMode) promiseSvc.clearPromise(pid, { externalPromise: options.externalPromise });
        return promiseSvc.getPromise(pid, { externalPromise: options.externalPromise });

    } catch (e) {

        errSvc.errorFromPromise(pid, { error: e.toString(), resource: (options && options.modelName) || 'unknown' },
            'Error retrieving resource list', 'resourceService.getList');
        return promiseSvc.getPromise(pid, { externalPromise: (options && options.externalPromise) });

    }

}

function processResourceSave(argNames, args, setupFunction, options) {

    var pid = promiseSvc.createPromise({ externalPromise: (options && options.externalPromise) });

    try {

        var completeOptions = utilObj.args2Obj((options || {}), argNames, args);
        if (setupFunction && typeof setupFunction === 'function')
            setupFunction(completeOptions);
        return save(completeOptions);

    } catch (e) {

        errSvc.errorFromPromise(pid, { error: e.toString(),
            resource: (options && options.modelName) || 'unknown' },
            'Error processing save for resource', 'resourceService.processResourceSave');
        return promiseSvc.getPromise(pid, { externalPromise: (options && options.externalPromise) });

    }
}

function getModelFromOptions(options, promiseId) {

    var modelName = (options && options.modelName) || '';
    var model = mongoose.model(modelName);
    if (!model && promiseId) errSvc.errorFromPromise(promiseId, {}, 'No model set for the resource');
    return model;

}

module.exports = {
    save: save,
    getSingle: getSingle,
    getList: getList,
    processResourceSave: processResourceSave,
    _getModelFromOptions: getModelFromOptions,
    _test: {
        rejectPromise: function (err, pid) {
            promiseSvc.reject(err, pid);
        },
        setErrorService: function (svc) {
            errSvc = svc;
        }
    }
};