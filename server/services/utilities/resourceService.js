"use strict";
require('require-enhanced')();

var errSvc = global.rootRequire('svc-error')(null, "resourceService");
var mongoose = require('mongoose');
var extend = require('extend');
var promiseSvc = global.rootRequire('svc-promise');


function save(options) {

    var addOnly = (options && options.addOnly) || false;
    var updateOnly = (options && options.updateOnly) || false;
    var pid = promiseSvc.createPromise();

    //Allow model to be set externally for testing purposes
    var model = (options && options.model) || getModelFromOptions(options, pid);

    //Allow for some pre-validation and rejection via promise
    var preValidation = (options && options.preValidation) || null;
    if (preValidation && typeof preValidation === 'function')
        preValidation(options, pid);


    //Get the search criteria for a single resource
    var singleSearch = (options && options.singleSearch) || null;
    if (addOnly) singleSearch = singleSearch || { _id: 0 };
    if (!singleSearch) errSvc.errorFromPromise(pid, {}, 'No search criteria set for a single ' + model.modelName);

    //Get the map function for properties to a resource
    var mapPropertiesToResource = (options && options.mapPropertiesToResource) || null;
    if (!mapPropertiesToResource || typeof mapPropertiesToResource !== 'function')
        errSvc.errorFromPromise(pid, {}, 'Missing map function for ' + model.modelName);

    //Do not continue if any rejections have occurred
    var promise = promiseSvc.getPromise(pid);
    if (promise.isRejected()) return promise;

    //Update or Add
    model.findOne(singleSearch).exec(function (err, resource) {
        if (err) errSvc.errorFromPromise(pid, err, 'Could not get ' + model.modelName + ' for update');
        if (resource) {

            if (addOnly)
                errSvc.errorFromPromise(pid,
                    err, 'Can only create new ' + model.modelName + ' with this method', "E1000");

            mapPropertiesToResource(resource)
                .then(function (resourceFinal) {

                    resourceFinal.save(function (err, resource) {
                        if (err) {
                            errSvc.errorFromPromise(pid, err, 'Could not save ' + model.modelName);
                        } else {
                            promiseSvc.resolve(resource, pid);
                        }
                    });
                })
                .fail(function(err) {
                    promiseSvc.reject(err, pid);
                });

        } else {

            if (updateOnly)
                errSvc.errorFromPromise(pid,
                    err, 'Can only update ' + model.modelName + ' with this method', "E1002");

            mapPropertiesToResource({})
                .then(function (resourceFinal) {

                    if (options.onNew) resourceFinal = extend(resourceFinal, options.onNew);

                    model.create(resourceFinal, function (err, resource) {
                        if (err) errSvc.errorFromPromise(pid, err, 'Could not create ' + model.modelName);
                        if (resource && resource._id) promiseSvc.resolve(resource, pid);
                    });
                })
                .fail(function(err) {
                    promiseSvc.reject(err, pid);
                });

        }
    });

    if (options && options.testMode) promiseSvc.clearPromise(pid);
    return promise;
}

function getSingle(options) {

    var pid = promiseSvc.createPromise();
    //Allow model to be set externally for testing purposes
    var model = (options && options.model) || getModelFromOptions(options, pid);

    //Set query and select
    var query = (options && options.query) || null;
    if (!query) errSvc.errorFromPromise(pid, {}, 'No query provided for resource ' + model.modelName);
    var select = (options && options.select) || '';


    //Do not continue if any rejections have occurred
    var promise = promiseSvc.getPromise(pid);
    if (promise.isRejected()) return promise;

    model.findOne(query, select).exec(function (err, resource) {
        if (err) errSvc.errorFromPromise(pid, err, 'Could not get ' + model.modelName + ' from search');
        if (resource) {
            promiseSvc.resolve(resource, pid);
        } else {
            errSvc.errorFromPromise(pid, {}, 'Could not find ' + model.modelName, 'E1001');
        }
    });

    if (options && options.testMode) promiseSvc.clearPromise(pid);
    return promise;

}

function getList(options) {

    var pid = promiseSvc.createPromise();

    //Allow model to be set externally for testing purposes
    var model = (options && options.model) || getModelFromOptions(options, pid);

    //Set query and select
    var query = (options && options.query) || null;
    if (!query) errSvc.errorFromPromise(pid, {}, 'No query provided for resource ' + model.modelName);
    var select = (options && options.select) || '';

    //Do not continue if any rejections have occurred
    var promise = promiseSvc.getPromise(pid);
    if (promise.isRejected()) return promise;

    model.find(query, select).exec(function (err, resources) {
        if (err) errSvc.errorFromPromise(pid, err, 'Could not get list of ' + model.modelName + ' from search');
        if (resources && resources.length > 0) {
            promiseSvc.resolve(resources, pid);
        } else {
            errSvc.errorFromPromise(pid, {}, 'Could not find any ' + model.modelName, 'E1001');
        }
    });

    if (options && options.testMode) promiseSvc.clearPromise(pid);
    return promise;

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
    _getModelFromOptions: getModelFromOptions,
    _test: {
        rejectPromise: function(err, pid) {
            promiseSvc.reject(err, pid);
        },
        setErrorService: function(svc) {
            errSvc = svc;
        }
    }
};