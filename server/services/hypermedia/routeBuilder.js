"use strict";
var _ = require("lodash");
var addRouteFn;
var baseUri;
var resources = {};

var resourceMethods = Object.freeze({
    GET: 'GET',
    PUT: 'PUT',
    POST: 'POST',
    DEL: 'DEL'
});

function Resource() {

    if (!(this instanceof Resource)) return new Resource();
    this.name = 'root';
    this.rel = 'root';
    this.uri = '';
    this.methods = [];
    this.nextResources = [];
    this.prevResource = null;

}


Resource.prototype.getRelUri = function() {

    return ((this.prevResource) ? this.prevResource.getRelUri() + '/' + this.uri : this.uri).replace('//','/');

};

Resource.prototype.getAbsUri = function() {

    return baseUri + this.getRelUri();

};

Resource.prototype.getName = function() {
    return this.name;
};

Resource.prototype.setResource = function(defaults) {

    defaults = defaults || {};
    if (!defaults.uri && !_.isString(defaults.uri)) throw new Error("Parameter object must include \'uri\'");
    if (!defaults.rel || !_.isString(defaults.rel)) defaults.rel = defaults.uri;
    if (!defaults.name && !_.isString(defaults.name)) defaults.name = defaults.uri;

    this.name = defaults.name;
    this.rel = defaults.rel;
    this.uri = defaults.uri;
    return this;

};

Resource.prototype.addResource = function(defaults) {

    if (!defaults.uri && !_.isString(defaults.uri)) throw new Error("Parameter object must include \'uri\'");
    var uris = defaults.uri.split("/");
    var res = null; var prevRes = this;

    //Chain resources if there is more than one resource in the url
    for (var i = 0; i < uris.length; i++) {
        var temp = _.clone(defaults);
        temp.uri = uris[i];
        console.log('Adding resource ' + (temp.uri || 'root'));
        res = new Resource().setResource(temp);
        prevRes.nextResources.push(res);
        res.prevResource = prevRes;
        prevRes = res;
    }
    return res;

};

Resource.prototype.addMethod = function(method) {

    var fns = Array.prototype.slice.call(arguments, 1);
    var options = _.chain(fns).filter(function(val) { return !_.isFunction(val); }).last().value() || {};
    if (options && _.isPlainObject(options) && _.size(options) > 0)
        fns = _.initial(fns, _.size(fns) - 1);
    if (!_.has(resourceMethods, method)) throw new Error("Method is not valid");


    if (_.size(fns) > 0 && _.every(fns, function(fn) { return _.isFunction(fn); })) {
        console.log('Adding method ' + method + ' to ' + this.getAbsUri());
        this.methods[method] = { fns: fns, options: options };
        addRouteFn(method, this.getRelUri(), fns);
        return this;
    } else {
        throw new Error('At least one invalid function in the middleware chain');
    }

};

Resource.prototype.getParent = function() {
    return this.prevResource;
};

Resource.prototype.getResource = function(name) {

    if ((name.toLowerCase() === this.name.toLowerCase())) return this;
    var test = null;
    _.forEach(this.nextResources, function(res) {
        test = test || res.getResource(name);
    });
    if (test) return test;
    return null;

};

module.exports = function(arFn, uri) {

    if (!addRouteFn && (!arFn || !_.isFunction(arFn)))
        throw new Error("An function that adds routes on the web server must be provided");
    //TODO-Randy: validate format
    if (!baseUri && (!uri || !_.isString(uri)))
        throw new Error("A valid base uri must be provided");

    if (!addRouteFn) addRouteFn = arFn;
    if (!baseUri) baseUri = uri;

    return {
        addResource: function(defaults) {
            resources = new Resource().addResource(defaults);
            return resources;
        },
        getResource: function(name) {
            if (_.isEmpty(resources) || !(resources instanceof Resource)) return null;
            return resources.getResource(name);
        },
        resourceMethods: resourceMethods
    };
};

