"use strict";
require('require-enhanced')();

var env = process.env.NODE_ENV = process.env.NODE_ENV || 'development';
var config = global.rootRequire('cfg-config')[env];
var links = {};

function attachLinksToObject(obj, linkArr) {
    //linkArr in format [{uri,rel,isRelative, method},...]
    clearLinks();
    if (Array.isArray(linkArr)) {
        linkArr.forEach(function (elem) {
            addLink(elem.uri, elem.rel, elem.isRelative, elem.method, elem.isSelf);
        });
    }
    obj[getLinkCollectionKey()] = getLinks();

    return obj;
}

function addLink(uri, rel, isRelative, method, isSelf) {
    isRelative = isRelative || false;
    isSelf = isSelf || false;
    method = method || 'GET';

    links[isSelf ? 'self' : rel] = (getLinkObject(uri, isRelative, method));
}

function getLinkObject(uri, isRelative, method) {
    isRelative = isRelative || false;
    return {
        href: (!isRelative ? config.baseUri : '') + uri,
        method: method,
        isRelative: isRelative
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
