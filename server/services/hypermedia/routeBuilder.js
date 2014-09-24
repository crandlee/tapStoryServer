"use strict";
var cb = require('common-bundle')();
var authMdl = cb.rootRequire('mdl-auth');
var bodyMdl = cb.rootRequire('mdl-bodyValidator');

var _ = cb._;

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
    this.methods = {};
    this.nextResources = [];
    this.prevResource = null;
    this.options = {};
}

Resource.prototype.getRelUri = function () {

    return ((this.prevResource)
        ? this.prevResource.getRelUri() + '/' + this.uri
        : this.uri).replace('//', '/');

};

Resource.prototype.getAbsUri = function (params) {

    return baseUri + applyParamsToUri(params, this.getRelUri());

};

Resource.prototype.getName = function () {
    return this.name;
};

Resource.prototype.setResource = function (defaults, options) {

    defaults = defaults || {};
    if (!defaults.uri && !_.isString(defaults.uri)) throw new Error("Parameter object must include \'uri\'");
    if (!defaults.rel || !_.isString(defaults.rel)) defaults.rel = defaults.uri;
    if (!defaults.name && !_.isString(defaults.name)) defaults.name = defaults.uri;
    if (options) this.options = options;
    this.name = defaults.name;
    this.rel = defaults.rel;
    this.uri = defaults.uri;

    return this;

};

Resource.prototype.addResource = function (defaults, options) {

    if (!defaults.uri && !_.isString(defaults.uri)) throw new Error("Parameter object must include \'uri\'");
    var uris = defaults.uri.split("/");
    var res = null;
    var prevRes = this;

    //Chain resources if there is more than one resource in the url
    for (var i = 0; i < uris.length; i++) {
        var temp = _.clone(defaults);
        temp.uri = uris[i];
        console.log('Adding resource ' + (temp.uri || 'root'));
        res = new Resource().setResource(temp, options);
        prevRes.nextResources.push(res);
        res.prevResource = prevRes;
        prevRes = res;
    }
    return res;

};

Resource.prototype.addMethod = function (method, authOptions) {

    var fns = Array.prototype.slice.call(arguments, 2);
    var options = _.chain(fns).filter(function (val) {
        return !_.isFunction(val);
    }).last().value() || {};
    if (options && _.isPlainObject(options) && _.size(options) > 0)
        fns = _.initial(fns, 1);
    if (!_.has(resourceMethods, method)) throw new Error("Method is not valid");

    if (_.size(fns) > 0 && _.every(fns, function (fn) {
        return _.isFunction(fn);
    })) {
        console.log('Adding method ' + method + ' to ' + this.getAbsUri());
        //Add global pre- and post-controller functions
        fns.splice(0, 0, _.partial(bodyMdl.validateBody, options.bodyParams));
        fns.splice(0, 0, _.partial(authMdl.authorize, authOptions.rules, authOptions.options));
        fns.push(_.partial(addLinks, this, options));
        this.methods[method] = { fns: fns, method: method, options: options, resource: this };
        addRouteFn(method, this.getRelUri(), fns);
        return this;
    } else {
        throw new Error('At least one invalid function in the middleware chain');
    }

};

Resource.prototype.getParent = function () {
    return this.prevResource;
};

Resource.prototype.getResource = function (name) {

    if ((name.toLowerCase() === this.name.toLowerCase())) return this;
    var test = null;
    _.forEach(this.nextResources, function (res) {
        test = test || res.getResource(name);
    });
    if (test) return test;
    return null;

};

function getLinkKey() {
    return "_links";
}

function getBaseLinks() {
    var obj = {};
    obj[getLinkKey()] = [];
    return obj;
}

function getBaseLink(rel, uri, method, options) {

    var optional = {};
    if (options.description) optional.description = options.description;
    if (options.bodyParams) optional.bodyParams = options.bodyParams;

    return _.extend({
        name: rel.toLowerCase() + '-' + method.toLowerCase(),
        href: uri,
        rel: rel,
        method: method
    }, optional);

}

function getTopLevelLinks(req, resource) {

    if (!resource || !(resource instanceof Resource)) throw new Error("Cannot get root links without a proper resource");

    var links = getBaseLinks();
    var currentResMethods = _.toArray(resource.methods);
    var nextResMethods = _.reduce(resource.nextResources, function (arr, nextRes) {
        return (!nextRes.options.collectionChild) ? _.union(arr, _.toArray(nextRes.methods)) : arr;
    }, []);
    links[getLinkKey()] = _.union(links[getLinkKey()], _(currentResMethods)
        .filter(function (method) {
            return (!method.options || !method.options.self);
        })
        .union(nextResMethods)
        .filter(function (method) {
            return (!method.options || !method.resource.options
                || !(method.resource.options.collectionChild && method.options.self));
        })
        .map(function (method) {
            return getBaseLink(method.resource.rel, method.resource.getAbsUri(req.params), method.method, method.options)
        })
        .value());
    return links;
}

function getDetailLinks(resource, collection) {

    if (!collection || !(_.isArray(collection))) throw new Error("Cannot get detail links without a collection of resources");

    var selfMethod = _(resource.nextResources)
        .reduce(function (arr, nextRes) {
            return (nextRes.options.collectionChild && nextRes.options.key) ? _.union(arr, _.toArray(nextRes.methods)) : arr;
        }, [])
        .filter(function (method) {
            return method.options.self;
        });

    //Drill down into the self method array and get the matched element.
    if (selfMethod && _.isArray(selfMethod) && selfMethod.length > 0)
        selfMethod = selfMethod[0];
    else
        return collection;
    if (!selfMethod) return collection;

    return _.map(collection, function (resource) {
        var links = getBaseLinks();
        var params = {};
        params[selfMethod.resource.options.key] = resource[selfMethod.resource.options.key];
        links[getLinkKey()] = getBaseLink('self',
            selfMethod.resource.getAbsUri(params), selfMethod.method, selfMethod.options);
        return _.extend(resource, links);
    });


}

function addLinks(resource, options, req, res, next) {

    var apiObject = res._tempData || res._body;
    if (apiObject) {

        var isHtml = (_.isString(apiObject) && apiObject.indexOf('<html') > -1);

        res.tempData = null;
        if (!(options.links === false) && (!req.params.links || req.params.links.toLowerCase() === 'true')) {
            if (!isHtml) {
                var hypObject = {};
                hypObject[resource.rel || 'resource'] = apiObject;
                if (_.isArray(apiObject)) apiObject = getDetailLinks(resource, apiObject);
                hypObject = _.extend(hypObject, getTopLevelLinks(req, resource, apiObject));
                res.json(hypObject);
            } else {
                res.end(apiObject);
            }
        } else {
            if (!isHtml) {
                res.json(apiObject);
            } else {
                res.end(apiObject);
            }
        }
    } else {
        res.end(apiObject);
    }
    return next();
}

function applyParamsToUri(params, uri) {
    if (params) {
        _.forEach(_.keys(params), function (key) {
            uri = uri.replace(':' + key, params[key]);
        });
    }
    return uri;
}


module.exports = function (arFn, uri) {

    if (!addRouteFn && (!arFn || !_.isFunction(arFn)))
        throw new Error("An function that adds routes on the web server must be provided");
    //TODO-Randy: validate format
    if (!baseUri && (!uri || !_.isString(uri)))
        throw new Error("A valid base uri must be provided");

    if (!addRouteFn) addRouteFn = arFn;
    if (!baseUri) baseUri = uri;

    return {
        addResource: function (defaults, options) {
            resources = new Resource().addResource(defaults, options);
            return resources;
        },
        getResource: function (name) {
            if (_.isEmpty(resources) || !(resources instanceof Resource)) return null;
            return resources.getResource(name);
        },
        resourceMethods: resourceMethods
    };
};

