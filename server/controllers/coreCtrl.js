"use strict";

var linkSvc = require('../services/hypermedia/linkService');

function core(req, res, next) {

    //Add top level hypermedia
    var obj = linkSvc.attachLinksToObject({}, [
        { uri: '/users', rel: 'users'},
        { uri: '/user', rel: 'user', method: 'POST'}
    ]);
    res.send(200, obj);

    return next();

}

module.exports = {
    core: core
};