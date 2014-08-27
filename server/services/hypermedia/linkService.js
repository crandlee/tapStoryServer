"use strict";
require('require-enhanced')();

var env = process.env.NODE_ENV = process.env.NODE_ENV || 'development';
var config = global.rootRequire('cfg-config')[env];
var links = {};

function attachLinksToObject(obj, linkArr, path) {
    //linkArr in format [{uri,rel,method},...]
    clearLinks();
    if (Array.isArray(linkArr)) {
        linkArr.forEach(function (elem) {
            addLink(elem.uri, elem.rel, elem.method, elem.isSelf, path);
        });
    }
    obj[getLinkCollectionKey()] = getLinks();

    return obj;
}

function addLink(uri, rel, method, isSelf, path) {

    isSelf = isSelf || false;
    method = method || 'GET';

    links[isSelf ? 'self' : rel] = (getLinkObject(uri, method, path));
}

function getLinkObject(uri, method, path) {
    return {
        href: path + uri,
        method: method
    };
}

function getLinkCollectionKey() {
    return '_links';
}

function clearLinks() {
    links = {};
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
