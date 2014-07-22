var errSvc = require('../error/errorService').initialize(null, "userService");
var Q = require('q');
var mongoose = require('mongoose');
var extend = require('extend');

function save(updateProperties, options) {

    var addOnly = (options && options.addOnly) || false;
    var updateOnly = (options && options.updateOnly) || false;
    var deferred = Q.defer();
    var model = getModelFromOptions(deferred, options);

    //Allow for some pre-validation and rejection via promise
    var preValidation = (options && options.preValidation) || null;
    if (preValidation && typeof preValidation === 'function')
        preValidation(updateProperties, options, deferred);


    //Get the search criteria for a single resource
    var singleSearch = (options && options.singleSearch) || null;
    if (addOnly) singleSearch = singleSearch || { _id: 0 };
    if (!singleSearch) errSvc.errorFromPromise(deferred, {}, 'No search criteria set for a single ' + model.modelName);

    //Get the map function for properties to a resource
    var mapPropertiesToResource = (options && options.mapPropertiesToResource) || null;
    if (!mapPropertiesToResource || typeof mapPropertiesToResource !== 'function')
        errSvc.errorFromPromise(deferred, {}, 'Missing map function for ' + model.modelName);

    //Do not continue if any rejections have occurred
    if (deferred.promise.isRejected()) return deferred.promise;

    //Update or Add
    model.findOne(singleSearch).exec(function (err, resource) {
        if (err) errSvc.errorFromPromise(deferred, err, 'Could not get ' + model.modelName + ' for update');
        if (resource) {

            if (addOnly)
                errSvc.errorFromPromise(deferred,
                    err, 'Can only create new ' + model.modelName + ' with this method', "E1000");

            mapPropertiesToResource(resource, updateProperties, deferred)
                .then(function (resourceFinal) {

                    resourceFinal.save(function (err, resource) {
                        if (err) {
                            errSvc.errorFromPromise(deferred, err, 'Could not save ' + model.modelName);
                        } else {
                            deferred.resolve(resource);
                        }
                    });
                })
                .fail(function(err) {
                    deferred.reject(err);
                });

        } else {

            if (updateOnly)
                errSvc.errorFromPromise(deferred,
                    err, 'Can only update ' + model.modelName + ' with this method', "E1002");

            mapPropertiesToResource({}, updateProperties, deferred)
                .then(function (resourceFinal) {

                    if (options.onNew) resourceFinal = extend(resourceFinal, options.onNew);

                    model.create(resourceFinal, function (err, resource) {
                        if (err) errSvc.errorFromPromise(deferred, err, 'Could not create ' + model.modelName);
                        if (resource && resource._id) deferred.resolve(resource);
                    });
                })
                .fail(function(err) {
                    deferred.reject(err);
                });

        }
    });

    return deferred.promise;
}

function getSingle(options) {

    var deferred = Q.defer();
    var model = getModelFromOptions(deferred, options);


    //Set query and select
    var query = (options && options.query) || null;
    if (!query) errSvc.errorFromPromise(deferred, {}, 'No query provided for resource ' + model.modelName);
    var select = (options && options.select) || '';

    //Do not continue if any rejections have occurred
    if (deferred.promise.isRejected()) return deferred.promise;

    model.findOne(query, select).exec(function (err, resource) {
        if (err) errSvc.errorFromPromise(deferred, err, 'Could not get ' + model.modelName + ' from search');
        if (resource) {
            deferred.resolve(resource);
        } else {
            errSvc.errorFromPromise(deferred, {}, 'Could not find ' + model.modelName, 'E1001');
        }
    });
    return deferred.promise;

}

function getList(options) {

    var deferred = Q.defer();
    var model = getModelFromOptions(deferred, options);


    //Set query and select
    var query = (options && options.query) || null;
    if (!query) errSvc.errorFromPromise(deferred, {}, 'No query provided for resource ' + model.modelName);
    var select = (options && options.select) || '';

    //Do not continue if any rejections have occurred
    if (deferred.promise.isRejected()) return deferred.promise;

    model.find(query, select).exec(function (err, resources) {
        if (err) errSvc.errorFromPromise(deferred, err, 'Could not get list of ' + model.modelName + ' from search');
        if (resources.length > 0) {
            deferred.resolve(resources);
        } else {
            errSvc.errorFromPromise(deferred, {}, 'Could not find any ' + model.modelName, 'E1001');
        }
    });
    return deferred.promise;

}

function getModelFromOptions(deferred, options) {

    var modelName = (options && options.model) || '';
    var model = mongoose.model(modelName);
    if (!model) errSvc.errorFromPromise(deferred, {}, 'No model set for the resource');
    return model;

}

module.exports = {
    save: save,
    getSingle: getSingle,
    getList: getList
};