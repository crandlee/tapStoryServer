"use strict";
var cb = require('common-bundle')();
var _ = cb._;
var errSvc = cb.errSvc;
var promise = cb.Promise;

var mongoose = require('mongoose');

function save(opts) {

    opts = opts || {};

    /**
     *     <p>Builds complete list of options for saving.</p>
     *     <p>The following are some of the options that this function builds/extends</p>
     *     <p><ul>
     *         <li>addOnly / updateOnly : Indicates whether the document can only be new / only updated.
     *              Without these options, the save will do either depending on the existence of the document</li>
     *         <li>model : Either pass in an existing mongoose model or one will be built with getModelFromOptions</li>
     *         <li>find : MongoDb styled search criteria to be used to find an existing document to update</li>
     *         <li>mapPropertiesToUpdateDoc : A function that takes an options object and an initial document and returns the object used for the MongoDb update parameter.</li>
     *         <li>preValidation: A function that takes an options object and does some simple validation of the options, throwing an error if something is wrong. This occurs before an attempted save.</li>
     *     </ul></p>
     * @params {Object} opts Any initial options for save that will be extended
     * @function
     */
    var setupOptions = opts.setupOptionsStub || function(opts) {

        opts.addOnly = opts.addOnly || false;
        opts.updateOnly = opts.updateOnly || false;
        opts.model = getModelFromOptions(opts);
        opts.find = opts.find || null;
        opts.buildDocument = opts.buildDocument || null;
        opts.preValidation = opts.preValidation || null;

        return opts;

    };

    var validateOptions = opts.validateOptionsStub || function(opts) {

        function getCustomValidatedOpts(opts, documents) {
            //Set documents on options for later retrieval
            opts.document = documents;
            //Allow custom component to validate
            if (opts.preValidation && typeof opts.preValidation === 'function')
                return promise.fcall(opts.preValidation, opts, documents);
            else
                return opts;
        }

        //Some global validation
        if (!opts.find && !opts.manualSave)
            errSvc.error('No search criteria set for save',
                { modelName: (opts.model && opts.model.modelName) });
        if ((!opts.buildDocument || typeof opts.buildDocument !== 'function') &&
            (!opts.manualSave || typeof opts.manualSave !== 'function'))
            errSvc.error('Document options must have either a buildDocument function or a manualSave function',
                { modelName: (opts.model && opts.model.modelName) });


        //If not manual save, then get a previous document and
        //pass that to the custom pre-validation routine (if it exists)
        //Otherwise, send in empty document
        if (!opts.manualSave) {
            var retrieveFn = (opts.findType && opts.findType.toLowerCase() === 'list') ?
                getList : getSingle;
            return retrieveFn({ model: opts.model, find: opts.find })
                .then(_.partial(getCustomValidatedOpts, opts));
        } else {
            opts.document = null;
            return getCustomValidatedOpts(opts, null);
        }


    };


    var saveDocument = opts.saveDocument || function(opts) {

        //Get the document from the options object
        var existDocuments = opts.document;
        delete opts.document;

        function setAddUpdateState(opts, document) {
            //If not explicitly set externally, then set add/update
            //flag by existence of a document
            if (!opts.addOnly && !opts.updateOnly) {
                if (document) opts.updateOnly = true; else opts.addOnly = true;
            }
            return opts;
        }

        opts = opts || {};
        if (opts.manualSave && (typeof opts.manualSave === 'function'))
            return promise.fcall(opts.manualSave, opts);
        else
            return promise.fcall(opts.buildDocument, opts, existDocuments || {})
                .then(function(saveDocument) {
                    if (saveDocument) {
                        opts = setAddUpdateState(opts, existDocuments);
                        return modelSave(saveDocument, opts);
                    } else {
                        throw new Error('No document returned from buildDocument');
                    }
                });


    };

    return promise.fcall(setupOptions, opts)
        .then(function(opts) {
            return promise.fcall(validateOptions, opts)
                .then(saveDocument);

        });

}

function getSingle(opts) {

    var setupOptions = function(opts) {

        opts = opts || {};
        opts.model = getModelFromOptions(opts);
        if (!opts.find) errSvc.error('No find provided for document',
            { modelName: (opts.model && opts.model.modelName) });

        return opts;
    };

    var getDocument = function(opts) {

        var fn = opts.model.findOne(opts.find, opts.select || '');

        //Allow populate option
        if (opts.populate && Array.isArray(opts.populate)) {
            fn = fn.populate.apply(fn, opts.populate);
        }

        return promise(fn.exec())
            .then(function(document) {
                return document;
            })
            .fail(function (err) {
                if (err) errSvc.error('An error was returned retrieving the document',
                    { error: err.message, modelName: opts.model.modelName, select: opts.select, query: opts.query });
            })
            .fin(function() {
                postOperationCleanup(opts);
            });

    };

    setupOptions(opts);

    return getDocument(opts);

}

function saveDocument(document) {

    var dfr = promise.defer();
    try {
        if (document) {
            document.save(function(err) {
                if (err) errSvc.error('Could not save document',
                    { document: JSON.stringify(document), error: err.message });
                dfr.resolve(document);
            });
        } else {
            errSvc.error('No document to be updated', {});
        }
    } catch(err) {
        dfr.reject(err);
    }
    return dfr.promise;

}

function getList(opts) {

    var setupOptions = function(opts) {

        opts = opts || {};
        opts.model = getModelFromOptions(opts);
        if (!opts.find) errSvc.error('No find provided for document list',
            { modelName: (opts.model && opts.model.modelName) });
        return opts;
    };

    var getDocuments = function(opts) {

        var fn = opts.model.find(opts.find, opts.select || '');

        //Allow populate option
        if (opts.populate && Array.isArray(opts.populate)) {
            fn = fn.populate.apply(fn, opts.populate);
        }

        return promise(fn.exec())
            .then(function(documents) {
                return documents;
            })
            .fail(function (err) {
                if (err) errSvc.error('An error was returned retrieving the document',
                    { error: err.message, modelName: opts.model.modelName, select: opts.select, query: opts.query });
            })
            .fin(function() {
                postOperationCleanup(opts);
            });


    };

    setupOptions(opts);

    return getDocuments(opts);

}

function processDocumentSave(params, setupFunction, options) {

    var completeOptions = cb.extend(options, params);
    if (setupFunction && typeof setupFunction === 'function') {
        return promise.fcall(setupFunction, completeOptions)
            .then(save);
    } else {
        //promise (call through 'this' to allow test stubbing)
        /* jshint validthis:true */
        return save(completeOptions);
    }

}

function getModelFromOptions(options) {

    //Allows model name to be in either model or modelName property
    //If model is object, then just return it
    var modelName = '';
    try {
        if (options.model && typeof options.model === 'string')
            options.modelName = options.model;
        if (options.model && typeof options.model === 'function')
            return options.model;
        modelName = (options && options.modelName) || '';
        var model = mongoose.model(modelName);
        if (!model) {
            errSvc.error({ modelName: modelName }, 'No model set for the document');
        }
        return model;
    } catch(err) {
        errSvc.error("Unable to set the model for the document",
            { error: err.message, modelName: modelName });
    }


}

/**
 * Calls update on a mongoose model with all the expected parameters
 * @param {Object} find A MongoDb style find criteria
 * @param {Object} document A MongoDb style update criteria
 * @param {Object} options MongoDb update options
 * @returns {adapter.deferred.promise|*|promise|Q.promise}
 * @throws MongoDb error if update fails
 */
function modelUpdate(find, document, options) {

    var dfr = promise.defer();
    try {
        options = options || {};
        options.model = getModelFromOptions(options);
        if (!find)
            dfr.reject(Error('No search criteria provided for model update'));
        options.updateOptions = cb.extend({ upsert: !options.updateOnly, new: true }, options.updateOptions);
        document = cb.extend(document, { $setOnInsert: options.onNew });
        //Prepare/convert document for saving
        var docObj = (document.toObject && typeof document.toObject === 'function') ?
            document.toObject() : document;
        delete docObj._id;
        options.model.findOneAndUpdate(find, docObj, options.updateOptions, function(err, obj) {
            if (err) dfr.reject(err);
            if (!obj) dfr.reject(new Error('Unable to update this resource. Verify that the resource exists or create a new one'));
            dfr.resolve(obj);
        });

    } catch(e) {
        dfr.reject(e);
    }

    dfr.promise.fin(function() {
        postOperationCleanup(options);
    });

    return dfr.promise;


}

function modelCreate(documents, options) {

    var dfr = promise.defer();
    try {
        options = options || {};
        options.model = getModelFromOptions(options);
        documents = cb.extend(documents, options.onNew);
        options.model.create(documents, function(err, obj) {
            if (err) {
                if (err.message.indexOf("E11000") > -1)
                    dfr.reject(new Error("This object already exists.  Please update instead of creating"));
                else
                    dfr.reject(err);
            } else {
                if (arguments.length > 3) {
                    //Case where more than one document was added return an array
                    obj = Array.prototype.slice.call(arguments, 2);
                }
            }
            dfr.resolve(obj);
        });
    } catch(e) {
        dfr.reject(e);
    }

    dfr.promise.fin(function() {
        postOperationCleanup(options);
    });

    return dfr.promise;


}


function modelSave(document, options) {

    if (options.noSave) return promise(document);
    if (options.addOnly) {
        return modelCreate(document, options);
    } else {
        return modelUpdate(options.find, document, options);
    }

}

function postOperationCleanup(opts) {
    opts.model = null;
}

module.exports = {
    save: promise.fbind(save),
    getSingle: promise.fbind(getSingle),
    getList: promise.fbind(getList),
    saveDocument: saveDocument,
    modelUpdate: modelUpdate,
    modelCreate: modelCreate,
    modelSave: modelSave,
    processDocumentSave: promise.fbind(processDocumentSave),
    _getModelFromOptions: getModelFromOptions
};