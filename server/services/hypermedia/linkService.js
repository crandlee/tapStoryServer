"use strict";
require('require-enhanced')();

var env = process.env.NODE_ENV = process.env.NODE_ENV || 'development';
var config = global.rootRequire('cfg-config')[env];
var links = [];

function attachLinksToObject(obj, linkArr) {
    //linkArr in format [{uri,rel,isRelative, method},...]
    clearLinks();
    if (Array.isArray(linkArr)) {
        linkArr.forEach(function (elem) {
            addLink(elem.uri, elem.rel, elem.isRelative, elem.method);
        });
    }
    obj[getLinkCollectionKey()] = getLinks();

    return obj;
}

function addLink(uri, rel, isRelative, method) {
    isRelative = isRelative || false;
    method = method || 'GET';
    links.push(getLinkObject(uri, rel, isRelative, method));
}

function getLinkObject(uri, rel, isRelative, method) {
    isRelative = isRelative || false;
    return {
        uri: (!isRelative ? config.baseUri : '') + uri,
        method: method,
        rel: rel
    };
}

function getLinkCollectionKey() {
    return '_link';
}

function clearLinks() {
    links = [];
}

function getLinks() {
    return links;
}

module.exports = {
    addLink: addLink,
    clearLinks: clearLinks,
    getLinkCollectionKey: getLinkCollectionKey,
    getLinks: getLinks,
    attachLinksToObject: attachLinksToObject
};
